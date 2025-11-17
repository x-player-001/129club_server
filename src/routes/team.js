const Router = require('koa-router');
const router = new Router();
const teamController = require('../controllers/team.controller');
const { authMiddleware, optionalAuthMiddleware, checkRole } = require('../middlewares/auth');

// 获取队伍列表（支持游客浏览）
router.get('/list', optionalAuthMiddleware, teamController.getTeamList);

// 获取队伍详情（支持游客浏览）
router.get('/:teamId', optionalAuthMiddleware, teamController.getTeamDetail);

// 创建队伍（管理员）
router.post('/', authMiddleware, checkRole(['super_admin']), teamController.createTeam);

// 更新队伍信息（队长或管理员）
router.put('/:teamId', authMiddleware, teamController.updateTeam);

// 获取队伍成员
router.get('/:teamId/members', authMiddleware, teamController.getTeamMembers);

// 队伍重组相关
router.post('/reshuffle/start', authMiddleware, checkRole(['super_admin']), teamController.startReshuffle);
router.post('/reshuffle/pick', authMiddleware, teamController.pickPlayer);
router.post('/reshuffle/:reshuffleId/complete', authMiddleware, teamController.completeReshuffle);
router.get('/reshuffle/:reshuffleId/status', authMiddleware, teamController.getReshuffleStatus);
router.get('/reshuffle/:reshuffleId/available', authMiddleware, teamController.getAvailablePlayers);
router.get('/reshuffle/history', authMiddleware, teamController.getReshuffleHistory);

// Draft历史
router.get('/draft-history/:userId', authMiddleware, teamController.getPlayerDraftHistory);

// 队伍对战记录
router.get('/vs', authMiddleware, teamController.getTeamVsRecord);

module.exports = router;
