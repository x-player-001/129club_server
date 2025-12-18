const Router = require('koa-router');
const router = new Router();
const shareConfigController = require('../controllers/shareConfig.controller');
const { authMiddleware, optionalAuthMiddleware, checkRole } = require('../middlewares/auth');

// 获取当前有效的分享配置（支持游客）
router.get('/active', optionalAuthMiddleware, shareConfigController.getActiveConfig);

// 获取分享配置历史记录（管理员）
router.get('/history', authMiddleware, checkRole(['super_admin']), shareConfigController.getConfigHistory);

// 创建新的分享配置（管理员）
router.post('/', authMiddleware, checkRole(['super_admin']), shareConfigController.createConfig);

// 激活指定的历史配置（管理员）
router.put('/:configId/activate', authMiddleware, checkRole(['super_admin']), shareConfigController.activateConfig);

// 删除指定配置（管理员）
router.delete('/:configId', authMiddleware, checkRole(['super_admin']), shareConfigController.deleteConfig);

module.exports = router;
