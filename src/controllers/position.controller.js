const positionService = require('../services/position.service');
const { success, error } = require('../utils/response');

/**
 * 获取位置列表
 */
exports.getPositionList = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await positionService.getPositionList(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 按类别分组获取位置列表
 */
exports.getPositionsByCategory = async (ctx) => {
  try {
    const result = await positionService.getPositionsByCategory();
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};
