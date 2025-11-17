const Router = require('koa-router');
const router = new Router();
const statsController = require('../controllers/stats.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');

// 获取个人统计（支持游客浏览）
router.get('/player/:userId', optionalAuthMiddleware, statsController.getPlayerStats);

// 获取队伍统计（支持游客浏览）
router.get('/team/:teamId', optionalAuthMiddleware, statsController.getTeamStats);

// 获取排行榜（支持游客浏览）
router.get('/ranking/:type', optionalAuthMiddleware, statsController.getRanking);

// 获取数据总览（需要登录，因为包含个人数据）
router.get('/overview', authMiddleware, statsController.getOverview);

// 获取队伍对比数据（支持游客浏览）
router.get('/team-compare', optionalAuthMiddleware, statsController.getTeamCompare);

module.exports = router;
