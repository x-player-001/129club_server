const statsService = require('../services/stats.service');
const { success, error } = require('../utils/response');

// 获取个人统计
exports.getPlayerStats = async (ctx) => {
  try {
    const { userId } = ctx.params;
    const params = ctx.query;
    const result = await statsService.getPlayerStats(userId, params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取队伍统计
exports.getTeamStats = async (ctx) => {
  try {
    const { teamId } = ctx.params;
    const params = ctx.query;
    const result = await statsService.getTeamStats(teamId, params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取排行榜
exports.getRanking = async (ctx) => {
  try {
    const { type } = ctx.params;
    const params = ctx.query;
    const result = await statsService.getRanking(type, params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取数据总览
exports.getOverview = async (ctx) => {
  try {
    const userId = ctx.state.user.id; // 从认证中间件获取当前用户ID
    const { filterType = 'season' } = ctx.query; // 获取筛选类型，默认为season
    const result = await statsService.getOverview(userId, filterType);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取队伍对比数据
exports.getTeamCompare = async (ctx) => {
  try {
    const { team1Id, team2Id } = ctx.query;
    const result = await statsService.getTeamCompare(team1Id, team2Id);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};
