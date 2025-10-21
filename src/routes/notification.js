const Router = require('koa-router');
const notificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router();

// Get user notifications
router.get('/list', authMiddleware, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// Mark notification as read
router.post('/:id/read', authMiddleware, notificationController.markAsRead);

// Mark notification as shown
router.post('/:id/shown', authMiddleware, notificationController.markAsShown);

// Delete notification
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;
