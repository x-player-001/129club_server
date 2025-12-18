const Router = require('koa-router');
const router = new Router();
const matchController = require('../controllers/match.controller');
const { authMiddleware, optionalAuthMiddleware, checkRole } = require('../middlewares/auth');

// 获取比赛列表（支持游客浏览）
router.get('/list', optionalAuthMiddleware, matchController.getMatchList);

// 获取比赛详情（支持游客浏览）
router.get('/:matchId', optionalAuthMiddleware, matchController.getMatchDetail);

// 创建比赛（管理员）
router.post('/', authMiddleware, checkRole(['super_admin', 'captain']), matchController.createMatch);

// 更新比赛信息
router.put('/:matchId', authMiddleware, matchController.updateMatch);

// 报名比赛
router.post('/:matchId/register', authMiddleware, matchController.registerMatch);

// 取消报名
router.delete('/:matchId/register', authMiddleware, matchController.cancelRegister);

// 请假
router.post('/:matchId/leave', authMiddleware, matchController.requestLeave);

// 取消请假
router.delete('/:matchId/leave', authMiddleware, matchController.cancelLeave);

// 获取报名列表
router.get('/:matchId/registration', authMiddleware, matchController.getRegistrationList);

// 设置阵容（队长）
router.post('/:matchId/lineup', authMiddleware, matchController.setLineup);

// 记录比赛事件
router.post('/:matchId/event', authMiddleware, matchController.recordEvent);

// 提交比赛结果
router.post('/:matchId/result', authMiddleware, matchController.submitResult);

// 取消比赛
router.put('/:matchId/cancel', authMiddleware, matchController.cancelMatch);

// 获取比赛参赛球员列表（实际到场球员）
router.get('/:matchId/participants', authMiddleware, matchController.getMatchParticipants);

// 设置比赛参赛球员（实际到场球员）
router.post('/:matchId/participants', authMiddleware, matchController.setMatchParticipants);

// 获取比赛可选球员列表（用于录入比赛事件）
router.get('/:matchId/selectable-players', authMiddleware, matchController.getSelectablePlayers);

module.exports = router;
