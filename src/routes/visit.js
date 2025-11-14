const Router = require('koa-router');
const router = new Router();
const visitController = require('../controllers/visit.controller');
const { authMiddleware } = require('../middlewares/auth');

// 记录用户访问
router.post('/record', authMiddleware, visitController.recordVisit);

// 获取个人访问统计
router.get('/stats', authMiddleware, visitController.getUserVisitStats);

// 获取活跃用户统计（管理员）
router.get('/active-users', authMiddleware, visitController.getActiveUsersStats);

module.exports = router;
