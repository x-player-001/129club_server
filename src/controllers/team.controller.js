const teamService = require('../services/team.service');
const { success, error } = require('../utils/response');

/**
 * 获取队伍列表
 */
exports.getTeamList = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await teamService.getTeamList(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取队伍详情
 */
exports.getTeamDetail = async (ctx) => {
  try {
    const { teamId } = ctx.params;
    const result = await teamService.getTeamDetail(teamId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 创建队伍
 */
exports.createTeam = async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await teamService.createTeam(data, userId);
    success(ctx, result, '创建成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 同时创建两个队伍
 */
exports.createTwoTeams = async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await teamService.createTwoTeams(data, userId);
    success(ctx, result, '两个队伍创建成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 更新队伍信息
 */
exports.updateTeam = async (ctx) => {
  try {
    const { teamId } = ctx.params;
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await teamService.updateTeam(teamId, data, userId);
    success(ctx, result, '更新成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取队伍成员
 */
exports.getTeamMembers = async (ctx) => {
  try {
    const { teamId } = ctx.params;
    const result = await teamService.getTeamMembers(teamId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 发起队伍重组
 */
exports.startReshuffle = async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await teamService.startReshuffle(data, userId);
    success(ctx, result, '重组已发起');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 选择球员（Draft）
 */
exports.pickPlayer = async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await teamService.pickPlayer(data, userId);
    success(ctx, result, '选人成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 完成队伍重组
 */
exports.completeReshuffle = async (ctx) => {
  try {
    const { reshuffleId } = ctx.params;
    const userId = ctx.state.user.id;
    const result = await teamService.completeReshuffle(reshuffleId, userId);
    success(ctx, result, '重组完成');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取重组状态（用于轮询）
 */
exports.getReshuffleStatus = async (ctx) => {
  try {
    const { reshuffleId } = ctx.params;
    const result = await teamService.getReshuffleStatus(reshuffleId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取可选球员列表
 */
exports.getAvailablePlayers = async (ctx) => {
  try {
    const { reshuffleId } = ctx.params;
    const result = await teamService.getAvailablePlayers(reshuffleId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取球员Draft历史
 */
exports.getPlayerDraftHistory = async (ctx) => {
  try {
    const { userId } = ctx.params;
    const result = await teamService.getPlayerDraftHistory(userId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取重组历史
 */
exports.getReshuffleHistory = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await teamService.getReshuffleHistory(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取队伍对战记录
 */
exports.getTeamVsRecord = async (ctx) => {
  try {
    const { team1Id, team2Id } = ctx.query;
    const result = await teamService.getTeamVsRecord(team1Id, team2Id);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};
