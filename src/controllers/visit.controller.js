const visitService = require('../services/visit.service');
const { success, error } = require('../utils/response');

/**
 * 记录用户访问
 */
exports.recordVisit = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const {
      platform,
      appVersion,
      scene,
      deviceModel,
      systemVersion
    } = ctx.request.body;

    // 从请求头获取IP地址
    const ipAddress = ctx.request.ip ||
                     ctx.request.headers['x-forwarded-for'] ||
                     ctx.request.headers['x-real-ip'];

    const result = await visitService.recordVisit(userId, {
      platform,
      appVersion,
      scene,
      ipAddress,
      deviceModel,
      systemVersion
    });

    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取用户访问统计
 */
exports.getUserVisitStats = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { days } = ctx.query;

    const result = await visitService.getUserVisitStats(userId, { days });
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取活跃用户统计（管理员）
 */
exports.getActiveUsersStats = async (ctx) => {
  try {
    const { days } = ctx.query;
    const result = await visitService.getActiveUsersStats({ days });
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

module.exports = exports;
