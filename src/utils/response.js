/**
 * 统一响应格式
 */

/**
 * 成功响应
 * @param {Object} ctx Koa上下文
 * @param {any} data 返回数据
 * @param {string} message 消息
 */
exports.success = (ctx, data = null, message = '操作成功') => {
  ctx.status = 200;
  ctx.set('Content-Type', 'application/json; charset=utf-8');
  ctx.body = {
    code: 0,
    success: true,
    message,
    data,
    timestamp: Date.now()
  };
};

/**
 * 失败响应
 * @param {Object} ctx Koa上下文
 * @param {string} message 错误消息
 * @param {number} code 错误代码
 */
exports.error = (ctx, message = '操作失败', code = 1) => {
  ctx.status = 200;
  ctx.set('Content-Type', 'application/json; charset=utf-8');
  ctx.body = {
    code,
    success: false,
    message,
    data: null,
    timestamp: Date.now()
  };
};

/**
 * 分页响应
 * @param {Object} ctx Koa上下文
 * @param {Array} list 数据列表
 * @param {number} total 总数
 * @param {number} page 当前页
 * @param {number} pageSize 每页数量
 */
exports.page = (ctx, list = [], total = 0, page = 1, pageSize = 20) => {
  ctx.status = 200;
  ctx.body = {
    code: 0,
    success: true,
    message: '查询成功',
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    },
    timestamp: Date.now()
  };
};

/**
 * 未授权响应
 * @param {Object} ctx Koa上下文
 * @param {string} message 消息
 */
exports.unauthorized = (ctx, message = '未授权，请先登录') => {
  ctx.status = 401;
  ctx.body = {
    code: 401,
    success: false,
    message,
    data: null,
    timestamp: Date.now()
  };
};

/**
 * 禁止访问响应
 * @param {Object} ctx Koa上下文
 * @param {string} message 消息
 */
exports.forbidden = (ctx, message = '没有权限访问') => {
  ctx.status = 403;
  ctx.body = {
    code: 403,
    success: false,
    message,
    data: null,
    timestamp: Date.now()
  };
};

/**
 * 资源不存在响应
 * @param {Object} ctx Koa上下文
 * @param {string} message 消息
 */
exports.notFound = (ctx, message = '资源不存在') => {
  ctx.status = 404;
  ctx.body = {
    code: 404,
    success: false,
    message,
    data: null,
    timestamp: Date.now()
  };
};

/**
 * 参数错误响应
 * @param {Object} ctx Koa上下文
 * @param {string} message 消息
 */
exports.badRequest = (ctx, message = '参数错误') => {
  ctx.status = 400;
  ctx.body = {
    code: 400,
    success: false,
    message,
    data: null,
    timestamp: Date.now()
  };
};
