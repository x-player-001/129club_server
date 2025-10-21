const Router = require('koa-router');
const quarterController = require('../controllers/quarter.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router();

// 录入单个节次
router.post('/match/:matchId/quarter', authMiddleware, quarterController.submitQuarter);

// 批量录入完整4节比赛
router.post('/match/:matchId/complete-quarters', authMiddleware, quarterController.submitCompleteQuarters);

// 补充4节制比赛结果（MVP、照片、总结）并完成比赛
router.post('/match/:matchId/supplement-result', authMiddleware, quarterController.supplementQuarterResult);

// 获取比赛详情（含节次）
router.get('/match/:matchId/detail', authMiddleware, quarterController.getMatchDetail);

// 获取球员比赛统计
router.get('/match/:matchId/player-stats', authMiddleware, quarterController.getPlayerStats);

// 解析比赛简报
router.post('/match/parse-report', authMiddleware, quarterController.parseReport);

// 查询解析任务状态
router.get('/match/parse-report/:taskId', authMiddleware, quarterController.getParseTask);

module.exports = router;
