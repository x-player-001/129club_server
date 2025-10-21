const { verifyToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/response');

/**
 * 认证中间件
 */
exports.authMiddleware = async (ctx, next) => {
  // 获取token
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return unauthorized(ctx, '请先登录');
  }

  // 验证token
  const payload = verifyToken(token);
  if (!payload) {
    return unauthorized(ctx, 'Token无效或已过期');
  }

  // 将用户信息挂载到ctx上
  ctx.state.user = payload;

  await next();
};

/**
 * 权限检查中间件
 * @param {Array<string>} roles 允许的角色
 */
exports.checkRole = (roles = []) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return unauthorized(ctx, '请先登录');
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        success: false,
        message: '没有权限访问',
        data: null,
        timestamp: Date.now()
      };
      return;
    }

    await next();
  };
};
