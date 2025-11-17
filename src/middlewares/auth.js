const { verifyToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/response');

/**
 * 认证中间件（强制登录）
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
 * 可选认证中间件（支持游客模式）
 * 如果有token则验证，没有token也允许通过
 */
exports.optionalAuthMiddleware = async (ctx, next) => {
  // 获取token
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (token) {
    // 如果有token，尝试验证
    const payload = verifyToken(token);
    if (payload) {
      // token有效，挂载用户信息
      ctx.state.user = payload;
    }
    // token无效也不拦截，继续执行
  }

  // 没有token或token无效，ctx.state.user 为 undefined
  // 业务代码可以通过 ctx.state.user 判断是否已登录
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
