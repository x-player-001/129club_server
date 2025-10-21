const Koa = require('koa');
const cors = require('koa-cors');
const { koaBody } = require('koa-body');
const koaLogger = require('koa-logger');
const koaJson = require('koa-json');
const koaStatic = require('koa-static');
const path = require('path');

require('dotenv').config();

const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/error');
const { authMiddleware } = require('./middlewares/auth');

// 路由
const routes = require('./routes');

// 初始化应用
const app = new Koa();

// 全局错误处理
app.use(errorHandler);

// 日志中间件
app.use(koaLogger());

// CORS跨域
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Body解析
app.use(koaBody({
  multipart: true,
  json: true, // 启用JSON body解析
  urlencoded: true, // 启用URL编码解析
  formidable: {
    maxFileSize: config.upload.maxFileSize,
    uploadDir: config.upload.path,
    keepExtensions: true
  }
}));

// JSON美化
app.use(koaJson());

// 静态文件服务
app.use(koaStatic(path.join(__dirname, '../uploads')));

// 日志记录（请求响应时间）
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

// 认证中间件（部分路由需要）
// app.use(authMiddleware);

// 注册路由
app.use(routes.routes()).use(routes.allowedMethods());

// 404处理
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    code: 404,
    message: '接口不存在'
  };
});

// 启动服务器
const PORT = config.port || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`🌐 API: http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
