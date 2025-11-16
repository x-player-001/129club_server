const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { Match, MatchResult } = require('../models');
const { Op } = require('sequelize');

const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

/**
 * 上传照片
 * @param {Object} file koa-body 解析的文件对象
 * @param {string} category 文件分类（如 'match_photos', 'user_avatars'）
 * @returns {Object} 文件信息
 */
exports.uploadPhoto = async (file, category = 'match_photos') => {
  if (!file) {
    throw new Error('没有上传文件');
  }

  // 验证文件类型
  const allowedTypes = config.upload.allowedTypes;
  if (!allowedTypes.includes(file.mimetype)) {
    // 删除临时文件
    await unlink(file.filepath);
    throw new Error(`不支持的文件类型: ${file.mimetype}，只支持: ${allowedTypes.join(', ')}`);
  }

  // 验证文件大小
  if (file.size > config.upload.maxFileSize) {
    await unlink(file.filepath);
    throw new Error(`文件大小超过限制: ${(config.upload.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
  }

  try {
    // 生成目标路径：uploads/category/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const relativeDir = path.join(category, String(year), month);
    const absoluteDir = path.join(__dirname, '../../uploads', relativeDir);

    // 确保目录存在
    await mkdir(absoluteDir, { recursive: true });

    // 生成唯一文件名：时间戳_随机数.ext
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalFilename || file.newFilename);
    const filename = `${timestamp}_${randomStr}${ext}`;

    // 目标文件路径
    const targetPath = path.join(absoluteDir, filename);

    // 移动文件
    await rename(file.filepath, targetPath);

    // 生成访问 URL
    const url = `/${relativeDir.replace(/\\/g, '/')}/${filename}`;

    logger.info(`File uploaded: ${url}, size: ${(file.size / 1024).toFixed(2)}KB`);

    return {
      filename,
      originalName: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
      url,
      uploadedAt: now
    };

  } catch (error) {
    // 出错时删除临时文件
    try {
      await unlink(file.filepath);
    } catch (e) {
      // 忽略删除错误
    }
    throw error;
  }
};

/**
 * 批量上传照片
 * @param {Array} files 文件数组
 * @param {string} category 文件分类
 * @returns {Array} 上传结果数组
 */
exports.uploadPhotos = async (files, category = 'match_photos') => {
  if (!files || files.length === 0) {
    throw new Error('没有上传文件');
  }

  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      const result = await exports.uploadPhoto(file, category);
      results.push(result);
    } catch (error) {
      errors.push({
        filename: file.originalFilename,
        error: error.message
      });
    }
  }

  return {
    success: results,
    failed: errors,
    total: files.length,
    successCount: results.length,
    failedCount: errors.length
  };
};

/**
 * 上传照片并关联到比赛
 * @param {Array} files 文件数组
 * @param {string} matchId 比赛ID
 * @param {string} category 文件分类
 * @returns {Object} 上传结果和关联信息
 */
exports.uploadMatchPhotos = async (files, matchId, category = 'match_photos') => {
  // 验证比赛是否存在
  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  // 上传照片
  const uploadResult = await exports.uploadPhotos(files, category);

  if (uploadResult.successCount === 0) {
    throw new Error('所有照片上传失败');
  }

  // 获取所有成功上传的照片URL
  const photoUrls = uploadResult.success.map(item => item.url);

  // 查找或创建 match_result 记录
  let matchResult = await MatchResult.findOne({ where: { matchId } });

  if (matchResult) {
    // 已有记录，追加照片URL
    const existingPhotos = matchResult.photos || [];
    const newPhotos = [...existingPhotos, ...photoUrls];

    await matchResult.update({ photos: newPhotos });

    logger.info(`Photos added to match ${matchId}: ${photoUrls.length} photos, total: ${newPhotos.length}`);
  } else {
    // 创建新记录（仅包含照片）
    matchResult = await MatchResult.create({
      matchId,
      team1Score: 0,
      team2Score: 0,
      photos: photoUrls,
      quarterSystem: match.quarterSystem || false
    });

    logger.info(`Match result created for ${matchId} with ${photoUrls.length} photos`);
  }

  return {
    upload: uploadResult,
    photos: photoUrls,
    totalPhotos: matchResult.photos.length,
    matchId
  };
};

/**
 * 删除文件
 * @param {string} url 文件URL (可以是完整URL或相对路径)
 */
exports.deletePhoto = async (url) => {
  try {
    // 从URL中提取相对路径
    // 支持: http://localhost:3000/match_photos/2025/10/xxx.png 或 /match_photos/2025/10/xxx.png
    let relativePath = url;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      // 从完整URL中提取路径部分
      const urlObj = new URL(url);
      relativePath = urlObj.pathname;
    }

    // 移除开头的斜杠
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }

    // 1. 删除本地文件
    const filepath = path.join(__dirname, '../../uploads', relativePath);
    await unlink(filepath);
    logger.info(`File deleted: ${relativePath}`);

    // 2. 从数据库中删除URL引用
    // 查找包含此URL的所有match_results记录
    const matchResults = await MatchResult.findAll({
      where: {
        photos: {
          [Op.ne]: null
        }
      }
    });

    // 遍历所有记录,从photos数组中移除该URL
    for (const result of matchResults) {
      const photos = result.photos || [];
      const urlToMatch = `/${relativePath.replace(/\\/g, '/')}`;

      // 检查是否包含该URL (支持相对路径和完整URL)
      const filteredPhotos = photos.filter(photoUrl => {
        return photoUrl !== url && photoUrl !== urlToMatch;
      });

      // 如果数组有变化,更新记录
      if (filteredPhotos.length !== photos.length) {
        await result.update({ photos: filteredPhotos });
        logger.info(`Removed photo URL from match_results: ${result.id}, remaining: ${filteredPhotos.length}`);
      }
    }

    return true;
  } catch (error) {
    logger.error(`Delete file failed: ${url}, error: ${error.message}`);
    return false;
  }
};

/**
 * 从URL下载文件并保存到服务器（用于处理微信临时文件）
 * @param {string} fileUrl 文件URL（可以是http://tmp/xxx 或完整URL）
 * @param {string} category 文件分类（如 'user_avatars'）
 * @returns {Object} 文件信息
 */
exports.downloadAndSaveFile = async (fileUrl, category = 'user_avatars') => {
  try {
    // 如果已经是服务器上的文件，直接返回
    if (fileUrl && !fileUrl.startsWith('http://tmp/') && !fileUrl.startsWith('https://')) {
      // 已经是相对路径或服务器URL，无需处理
      if (fileUrl.startsWith('/')) {
        return { url: fileUrl };
      }
      // 如果是完整的服务器URL，提取路径部分
      try {
        const urlObj = new URL(fileUrl);
        return { url: urlObj.pathname };
      } catch {
        return { url: fileUrl };
      }
    }

    logger.info(`Downloading file from URL: ${fileUrl}`);

    // 下载文件
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });

    // 获取文件内容
    const fileBuffer = Buffer.from(response.data);

    // 从响应头获取文件类型
    const contentType = response.headers['content-type'] || 'image/jpeg';

    // 验证文件类型
    const allowedTypes = config.upload.allowedTypes;
    if (!allowedTypes.includes(contentType)) {
      throw new Error(`不支持的文件类型: ${contentType}`);
    }

    // 验证文件大小
    if (fileBuffer.length > config.upload.maxFileSize) {
      throw new Error(`文件大小超过限制: ${(config.upload.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // 生成目标路径：uploads/category/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const relativeDir = path.join(category, String(year), month);
    const absoluteDir = path.join(__dirname, '../../uploads', relativeDir);

    // 确保目录存在
    await mkdir(absoluteDir, { recursive: true });

    // 生成唯一文件名：时间戳_随机数.ext
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);

    // 根据content-type确定扩展名
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('gif')) ext = '.gif';
    else if (contentType.includes('webp')) ext = '.webp';

    const filename = `${timestamp}_${randomStr}${ext}`;

    // 目标文件路径
    const targetPath = path.join(absoluteDir, filename);

    // 保存文件
    await writeFile(targetPath, fileBuffer);

    // 生成访问 URL
    const url = `/${relativeDir.replace(/\\/g, '/')}/${filename}`;

    logger.info(`File downloaded and saved: ${url}, size: ${(fileBuffer.length / 1024).toFixed(2)}KB`);

    return {
      filename,
      mimetype: contentType,
      size: fileBuffer.length,
      url,
      uploadedAt: now
    };

  } catch (error) {
    logger.error(`Download file failed: ${fileUrl}, error: ${error.message}`);
    throw new Error(`下载文件失败: ${error.message}`);
  }
};

module.exports = exports;
