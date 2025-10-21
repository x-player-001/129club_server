const Router = require('koa-router');
const router = new Router();
const seasonController = require('../controllers/season.controller');
const { authMiddleware } = require('../middlewares/auth');

// 创建赛季
router.post('/', authMiddleware, seasonController.createSeason);

// 获取赛季列表
router.get('/list', authMiddleware, seasonController.getSeasonList);

// 获取赛季详情
router.get('/:seasonId/detail', authMiddleware, seasonController.getSeasonDetail);

// 获取赛季统计
router.get('/:seasonId/statistics', authMiddleware, seasonController.getSeasonStatistics);

// 更新赛季信息
router.put('/:seasonId', authMiddleware, seasonController.updateSeason);

// 激活赛季
router.post('/:seasonId/activate', authMiddleware, seasonController.activateSeason);

// 完成赛季
router.post('/:seasonId/complete', authMiddleware, seasonController.completeSeason);

// 删除赛季
router.delete('/:seasonId', authMiddleware, seasonController.deleteSeason);

module.exports = router;
