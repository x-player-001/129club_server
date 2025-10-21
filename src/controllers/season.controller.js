const seasonService = require('../services/season.service');
const { success, error } = require('../utils/response');

// 创建赛季
exports.createSeason = async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await seasonService.createSeason(data, userId);
    success(ctx, result, '创建成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取赛季列表
exports.getSeasonList = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await seasonService.getSeasonList(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取赛季详情
exports.getSeasonDetail = async (ctx) => {
  try {
    const { seasonId } = ctx.params;
    const result = await seasonService.getSeasonDetail(seasonId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 更新赛季信息
exports.updateSeason = async (ctx) => {
  try {
    const { seasonId } = ctx.params;
    const data = ctx.request.body;
    const result = await seasonService.updateSeason(seasonId, data);
    success(ctx, result, '更新成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 删除赛季
exports.deleteSeason = async (ctx) => {
  try {
    const { seasonId } = ctx.params;
    const result = await seasonService.deleteSeason(seasonId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取赛季统计
exports.getSeasonStatistics = async (ctx) => {
  try {
    const { seasonId } = ctx.params;
    const result = await seasonService.getSeasonStatistics(seasonId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 激活赛季
exports.activateSeason = async (ctx) => {
  try {
    const { seasonId } = ctx.params;
    const result = await seasonService.activateSeason(seasonId);
    success(ctx, result, '赛季已激活');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 完成赛季
exports.completeSeason = async (ctx) => {
  try {
    const { seasonId } = ctx.params;
    const result = await seasonService.completeSeason(seasonId);
    success(ctx, result, '赛季已完成');
  } catch (err) {
    error(ctx, err.message);
  }
};
