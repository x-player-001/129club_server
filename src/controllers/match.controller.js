const matchService = require('../services/match.service');
const { success, error } = require('../utils/response');

// 获取比赛列表
exports.getMatchList = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await matchService.getMatchList(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取比赛详情
exports.getMatchDetail = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const result = await matchService.getMatchDetail(matchId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 创建比赛
exports.createMatch = async (ctx) => {
  try {
    const bodyData = ctx.request.body;
    const userId = ctx.state.user.id;

    // 字段映射：前端使用 datetime，后端使用 matchDate
    const data = {
      ...bodyData,
      matchDate: bodyData.datetime || bodyData.matchDate
    };

    const result = await matchService.createMatch(data, userId);
    success(ctx, result, '创建成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 更新比赛信息
exports.updateMatch = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const result = await matchService.updateMatch(matchId, data);
    success(ctx, result, '更新成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 报名比赛
exports.registerMatch = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const userId = ctx.state.user.id;
    const data = ctx.request.body;
    const result = await matchService.registerMatch(matchId, userId, data);
    success(ctx, result, '报名成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 取消报名
exports.cancelRegister = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const userId = ctx.state.user.id;
    const result = await matchService.cancelRegister(matchId, userId);
    success(ctx, result, '取消成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 请假
exports.requestLeave = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const userId = ctx.state.user.id;
    const data = ctx.request.body;
    const result = await matchService.requestLeave(matchId, userId, data);
    success(ctx, result, '请假成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 取消请假
exports.cancelLeave = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const userId = ctx.state.user.id;
    const result = await matchService.cancelLeave(matchId, userId);
    success(ctx, result, '已取消请假');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取报名列表
exports.getRegistrationList = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const result = await matchService.getRegistrationList(matchId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 设置阵容
exports.setLineup = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await matchService.setLineup(matchId, data, userId);
    success(ctx, result, '阵容设置成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 记录比赛事件
exports.recordEvent = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const result = await matchService.recordEvent(matchId, data);
    success(ctx, result, '记录成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 提交比赛结果
exports.submitResult = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await matchService.submitResult(matchId, data, userId);
    success(ctx, result, '提交成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 取消比赛
exports.cancelMatch = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const result = await matchService.cancelMatch(matchId);
    success(ctx, result, '比赛已取消');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取比赛参赛球员列表
exports.getMatchParticipants = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const result = await matchService.getMatchParticipants(matchId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};


// 设置比赛参赛球员
exports.setMatchParticipants = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const result = await matchService.setMatchParticipants(matchId, data);
    success(ctx, result, '参赛球员设置成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取比赛可选球员列表（用于录入比赛事件）
exports.getSelectablePlayers = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const { teamId } = ctx.query;

    if (!teamId) {
      return error(ctx, '缺少队伍ID参数', 400);
    }

    const result = await matchService.getSelectablePlayers(matchId, teamId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取比赛分享配置
 */
exports.getShareConfig = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const result = await matchService.getShareConfig(matchId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 设置比赛分享配置
 */
exports.setShareConfig = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const result = await matchService.setShareConfig(matchId, data);
    success(ctx, result, result.created ? '配置创建成功' : '配置更新成功');
  } catch (err) {
    error(ctx, err.message);
  }
};
