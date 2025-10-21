const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
exports.errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 记录错误日志
    logger.error(`Error: ${err.message}`, {
      url: ctx.url,
      method: ctx.method,
      stack: err.stack
    });

    // 返回错误响应
    ctx.status = err.status || 500;
    ctx.body = {
      code: err.status || 500,
      success: false,
      message: err.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    };

    // 触发错误事件
    ctx.app.emit('error', err, ctx);
  }
};
