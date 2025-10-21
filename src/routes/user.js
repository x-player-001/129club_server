const Router = require('koa-router');
const router = new Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth');

// 用户登录
router.post('/login', userController.login);

// 获取用户信息（需要认证）
router.get('/info', authMiddleware, userController.getUserInfo);

// 更新用户信息（需要认证）
router.put('/info', authMiddleware, userController.updateUserInfo);

// 获取成员列表
router.get('/members', authMiddleware, userController.getMemberList);

// 获取成员详情
router.get('/members/:userId', authMiddleware, userController.getMemberDetail);

module.exports = router;
