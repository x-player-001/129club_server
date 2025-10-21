const Router = require('koa-router');
const router = new Router();
const statsController = require('../controllers/stats.controller');
const { authMiddleware } = require('../middlewares/auth');

// 获取个人统计
router.get('/player/:userId', authMiddleware, statsController.getPlayerStats);

// 获取队伍统计
router.get('/team/:teamId', authMiddleware, statsController.getTeamStats);

// 获取排行榜
router.get('/ranking/:type', authMiddleware, statsController.getRanking);

// 获取数据总览
router.get('/overview', authMiddleware, statsController.getOverview);

// 获取队伍对比数据
router.get('/team-compare', authMiddleware, statsController.getTeamCompare);

module.exports = router;
