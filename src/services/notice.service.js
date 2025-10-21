const { Op } = require('sequelize');
const { Notice, User } = require('../models');
const logger = require('../utils/logger');

/**
 * 获取公告列表
 * @param {Object} params 查询参数 { type, page, pageSize }
 */
exports.getNoticeList = async (params = {}) => {
  const {
    type,
    page = 1,
    pageSize = 20
  } = params;

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  const where = {
    // 只显示未过期的公告
    [Op.or]: [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } }
    ]
  };

  if (type) {
    where.type = type;
  }

  const { count, rows } = await Notice.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'publisher',
        attributes: ['id', 'nickname', 'realName', 'avatar']
      }
    ],
    offset,
    limit,
    order: [
      ['isPinned', 'DESC'],
      ['publishedAt', 'DESC']
    ]
  });

  return {
    list: rows,
    total: count,
    page: parseInt(page),
    pageSize: limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * 获取公告详情
 * @param {string} noticeId 公告ID
 */
exports.getNoticeDetail = async (noticeId) => {
  const notice = await Notice.findByPk(noticeId, {
    include: [
      {
        model: User,
        as: 'publisher',
        attributes: ['id', 'nickname', 'realName', 'avatar']
      }
    ]
  });

  if (!notice) {
    throw new Error('公告不存在');
  }

  // 增加查看次数
  await notice.increment('viewCount');

  return notice;
};

/**
 * 发布公告
 * @param {Object} data 公告数据 { title, content, type, priority, isPinned, expiresAt }
 * @param {string} userId 发布者ID
 */
exports.publishNotice = async (data, userId) => {
  const {
    title,
    content,
    type = 'announcement',
    priority = 'medium',
    isPinned = false,
    expiresAt
  } = data;

  if (!title || !content) {
    throw new Error('标题和内容不能为空');
  }

  // 验证用户权限（可以在controller层验证，这里简单检查）
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  if (user.role !== 'super_admin' && user.role !== 'captain') {
    throw new Error('只有管理员和队长可以发布公告');
  }

  const notice = await Notice.create({
    title,
    content,
    type,
    priority,
    isPinned,
    publisherId: userId,
    publishedAt: new Date(),
    expiresAt: expiresAt || null
  });

  logger.info(`Notice published: ${notice.id} by ${userId}`);

  return notice;
};

/**
 * 更新公告
 * @param {string} noticeId 公告ID
 * @param {Object} data 更新数据
 * @param {string} userId 操作者ID
 */
exports.updateNotice = async (noticeId, data, userId) => {
  const notice = await Notice.findByPk(noticeId);

  if (!notice) {
    throw new Error('公告不存在');
  }

  // 验证权限：只有发布者或管理员可以更新
  const user = await User.findByPk(userId);
  if (notice.publisherId !== userId && user.role !== 'super_admin') {
    throw new Error('无权限修改此公告');
  }

  const allowedFields = ['title', 'content', 'type', 'priority', 'isPinned', 'expiresAt'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  await notice.update(updateData);

  logger.info(`Notice updated: ${noticeId} by ${userId}`);

  return notice;
};

/**
 * 删除公告
 * @param {string} noticeId 公告ID
 * @param {string} userId 操作者ID
 */
exports.deleteNotice = async (noticeId, userId) => {
  const notice = await Notice.findByPk(noticeId);

  if (!notice) {
    throw new Error('公告不存在');
  }

  // 验证权限：只有发布者或管理员可以删除
  const user = await User.findByPk(userId);
  if (notice.publisherId !== userId && user.role !== 'super_admin') {
    throw new Error('无权限删除此公告');
  }

  await notice.destroy();

  logger.info(`Notice deleted: ${noticeId} by ${userId}`);

  return { message: '删除成功' };
};
