const Router = require('koa-router');
const router = new Router();

// 导入各模块路由
const userRoutes = require('./user');
const teamRoutes = require('./team');
const matchRoutes = require('./match');
const statsRoutes = require('./stats');
const noticeRoutes = require('./notice');
const positionRoutes = require('./position');
const quarterRoutes = require('./quarter');
const seasonRoutes = require('./season');
const uploadRoutes = require('./upload');
const achievementRoutes = require('./achievement');
const notificationRoutes = require('./notification');
const visitRoutes = require('./visit');
const shareConfigRoutes = require('./shareConfig');

// API版本前缀
const API_PREFIX = '/api';

// 健康检查
router.get('/health', async (ctx) => {
  ctx.body = {
    code: 0,
    message: 'Server is running',
    data: {
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});

// 注册各模块路由
router.use(`${API_PREFIX}/user`, userRoutes.routes(), userRoutes.allowedMethods());
router.use(`${API_PREFIX}/team`, teamRoutes.routes(), teamRoutes.allowedMethods());
router.use(`${API_PREFIX}/match`, matchRoutes.routes(), matchRoutes.allowedMethods());
router.use(`${API_PREFIX}/stats`, statsRoutes.routes(), statsRoutes.allowedMethods());
router.use(`${API_PREFIX}/notice`, noticeRoutes.routes(), noticeRoutes.allowedMethods());
router.use(`${API_PREFIX}/position`, positionRoutes.routes(), positionRoutes.allowedMethods());
router.use(`${API_PREFIX}/season`, seasonRoutes.routes(), seasonRoutes.allowedMethods());
router.use(`${API_PREFIX}/upload`, uploadRoutes.routes(), uploadRoutes.allowedMethods());
router.use(`${API_PREFIX}/achievement`, achievementRoutes.routes(), achievementRoutes.allowedMethods());
router.use(`${API_PREFIX}/notification`, notificationRoutes.routes(), notificationRoutes.allowedMethods());
router.use(`${API_PREFIX}/visit`, visitRoutes.routes(), visitRoutes.allowedMethods());
router.use(`${API_PREFIX}/share-config`, shareConfigRoutes.routes(), shareConfigRoutes.allowedMethods());
// 4节制比赛路由直接注册到 /api 下，因为路由定义中已包含 /match 前缀
router.use(`${API_PREFIX}`, quarterRoutes.routes(), quarterRoutes.allowedMethods());

module.exports = router;
