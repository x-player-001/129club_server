/**
 * 身价模块路由
 */

const Router = require('koa-router');
const router = new Router();
const valueController = require('../controllers/value.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// 公开接口
router.get('/ranking', valueController.getYearlyValueRanking);           // 年度身价排行榜
router.get('/club-year/current', valueController.getCurrentClubYear);    // 获取当前俱乐部年度
router.get('/club-years', valueController.getClubYears);                 // 获取俱乐部年度列表

// 需要登录的接口
router.get('/my', authMiddleware, valueController.getMyYearlyValue);              // 我的年度身价
router.get('/my/records', authMiddleware, valueController.getMyValueRecords);     // 我的身价明细
router.post('/service', authMiddleware, valueController.addServiceValue);          // 申报服务身价

// 查看其他球员（需要登录）
router.get('/player/:userId', authMiddleware, valueController.getPlayerYearlyValue);       // 球员年度身价
router.get('/player/:userId/records', authMiddleware, valueController.getPlayerValueRecords); // 球员身价明细

// 管理员接口
router.get('/pending', authMiddleware, adminMiddleware, valueController.getPendingServiceValues);  // 待审核列表
router.post('/review/:valueId', authMiddleware, adminMiddleware, valueController.reviewServiceValue); // 审核服务身价
router.post('/special', authMiddleware, adminMiddleware, valueController.addSpecialValue);         // 添加特殊奖励
router.post('/recalculate/:matchId', authMiddleware, adminMiddleware, valueController.recalculateMatchValues); // 重算比赛身价

module.exports = router;
