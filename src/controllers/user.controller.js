const userService = require('../services/user.service');
const { success, error } = require('../utils/response');

/**
 * 用户登录
 */
exports.login = async (ctx) => {
  try {
    const { code, userInfo } = ctx.request.body;

    if (!code) {
      return error(ctx, '缺少登录code', 400);
    }

    const result = await userService.login(code, userInfo);
    success(ctx, result, '登录成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取用户信息
 */
exports.getUserInfo = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const result = await userService.getUserInfo(userId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 更新用户信息
 */
exports.updateUserInfo = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const data = ctx.request.body;
    const result = await userService.updateUserInfo(userId, data);
    success(ctx, result, '更新成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取成员列表
 */
exports.getMemberList = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await userService.getMemberList(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 获取成员详情
 */
exports.getMemberDetail = async (ctx) => {
  try {
    const { userId } = ctx.params;
    const result = await userService.getMemberDetail(userId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};
/**
 * 获取号码墙数据
 */
exports.getJerseyNumbers = async (ctx) => {
  try {
    const result = await userService.getJerseyNumbers();
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * 搜索用户
 */
exports.searchUsers = async (ctx) => {
  try {
    const { keyword, limit = 10 } = ctx.query;
    const result = await userService.searchUsers(keyword, limit);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};
