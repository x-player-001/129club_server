const Router = require('koa-router');
const uploadController = require('../controllers/upload.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router();

// 上传单张照片
// POST /api/upload/photo
router.post('/photo', authMiddleware, uploadController.uploadPhoto);

// 批量上传照片
// POST /api/upload/photos
router.post('/photos', authMiddleware, uploadController.uploadPhotos);

// 上传比赛照片（自动关联到比赛）
// POST /api/upload/match/:matchId/photos
router.post('/match/:matchId/photos', authMiddleware, uploadController.uploadMatchPhotos);

// 删除照片
// DELETE /api/upload/photo
router.delete('/photo', authMiddleware, uploadController.deletePhoto);

// 删除照片 (POST版本,更容易传参)
// POST /api/upload/delete-photo
router.post('/delete-photo', authMiddleware, uploadController.deletePhoto);

module.exports = router;
