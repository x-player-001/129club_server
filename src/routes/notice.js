const Router = require('koa-router');
const router = new Router();
const noticeController = require('../controllers/notice.controller');
const { authMiddleware, optionalAuthMiddleware, checkRole } = require('../middlewares/auth');

// 获取公告列表（支持游客浏览）
router.get('/list', optionalAuthMiddleware, noticeController.getNoticeList);

// 获取公告详情（支持游客浏览）
router.get('/:noticeId', optionalAuthMiddleware, noticeController.getNoticeDetail);

// 发布公告（管理员和队长）
router.post('/', authMiddleware, checkRole(['super_admin', 'captain']), noticeController.publishNotice);

// 更新公告（管理员和队长）
router.put('/:noticeId', authMiddleware, checkRole(['super_admin', 'captain']), noticeController.updateNotice);

// 删除公告（管理员和队长）
router.delete('/:noticeId', authMiddleware, checkRole(['super_admin', 'captain']), noticeController.deleteNotice);

module.exports = router;
