const uploadService = require('../services/upload.service');
const { success, error } = require('../utils/response');

/**
 * 上传单张照片
 */
exports.uploadPhoto = async (ctx) => {
  try {
    const file = ctx.request.files?.photo;

    if (!file) {
      return error(ctx, '请选择要上传的文件');
    }

    const category = ctx.request.body?.category || 'match_photos';
    const result = await uploadService.uploadPhoto(file, category);

    success(ctx, result, '上传成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 批量上传照片
 */
exports.uploadPhotos = async (ctx) => {
  try {
    const files = ctx.request.files?.photos;

    if (!files) {
      return error(ctx, '请选择要上传的文件');
    }

    // 确保 files 是数组
    const fileArray = Array.isArray(files) ? files : [files];
    const category = ctx.request.body?.category || 'match_photos';

    const result = await uploadService.uploadPhotos(fileArray, category);

    if (result.failedCount > 0) {
      success(ctx, result, `上传完成，成功 ${result.successCount} 个，失败 ${result.failedCount} 个`);
    } else {
      success(ctx, result, '全部上传成功');
    }
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 上传比赛照片（自动关联到比赛）
 */
exports.uploadMatchPhotos = async (ctx) => {
  try {
    const { matchId } = ctx.params;

    // 打印调试信息
    console.log('Request files:', ctx.request.files);
    console.log('Request body:', ctx.request.body);

    // 尝试获取文件，支持多种字段名
    let files = ctx.request.files?.photos
             || ctx.request.files?.photo
             || ctx.request.files?.file
             || ctx.request.files?.files;

    if (!files) {
      return error(ctx, '请选择要上传的文件');
    }

    // 确保 files 是数组
    const fileArray = Array.isArray(files) ? files : [files];
    const category = ctx.request.body?.category || 'match_photos';

    const result = await uploadService.uploadMatchPhotos(fileArray, matchId, category);

    success(ctx, result, `成功上传 ${result.photos.length} 张照片到比赛`);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 删除照片
 */
exports.deletePhoto = async (ctx) => {
  try {
    // 调试：打印请求信息
    console.log('DELETE photo - body:', ctx.request.body);
    console.log('DELETE photo - query:', ctx.query);

    // 支持从 body 或 query 获取 url
    const url = ctx.request.body?.url || ctx.query.url;

    console.log('DELETE photo - final url:', url);

    if (!url) {
      return error(ctx, '请提供文件URL');
    }

    const result = await uploadService.deletePhoto(url);

    if (result) {
      success(ctx, null, '删除成功');
    } else {
      error(ctx, '删除失败');
    }
  } catch (err) {
    error(ctx, err.message);
  }
};

module.exports = exports;
