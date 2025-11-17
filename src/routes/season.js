const Router = require('koa-router');
const router = new Router();
const seasonController = require('../controllers/season.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');

// 创建赛季
router.post('/', authMiddleware, seasonController.createSeason);

// 获取赛季列表（支持游客浏览）
router.get('/list', optionalAuthMiddleware, seasonController.getSeasonList);

// 获取赛季详情（支持游客浏览）
router.get('/:seasonId/detail', optionalAuthMiddleware, seasonController.getSeasonDetail);

// 获取赛季统计（支持游客浏览）
router.get('/:seasonId/statistics', optionalAuthMiddleware, seasonController.getSeasonStatistics);

// 更新赛季信息
router.put('/:seasonId', authMiddleware, seasonController.updateSeason);

// 激活赛季
router.post('/:seasonId/activate', authMiddleware, seasonController.activateSeason);

// 完成赛季
router.post('/:seasonId/complete', authMiddleware, seasonController.completeSeason);

// 删除赛季
router.delete('/:seasonId', authMiddleware, seasonController.deleteSeason);

module.exports = router;
