const { Notification } = require('../models');
const { success, error } = require('../utils/response');

/**
 * Get user notifications
 */
exports.getNotifications = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { isRead, isShown, type, page = 1, limit = 20 } = ctx.query;

    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    if (isShown !== undefined) {
      where.isShown = isShown === 'true';
    }
    if (type) {
      where.type = type;
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    success(ctx, {
      list: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { id } = ctx.params;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return error(ctx, 'Notification not found');
    }

    await notification.update({ isRead: true });
    success(ctx, notification, 'Marked as read');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Mark notification as shown
 */
exports.markAsShown = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { id } = ctx.params;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return error(ctx, 'Notification not found');
    }

    await notification.update({ isShown: true });
    success(ctx, notification, 'Marked as shown');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { id } = ctx.params;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return error(ctx, 'Notification not found');
    }

    await notification.destroy();
    success(ctx, null, 'Notification deleted');
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Get unread count
 */
exports.getUnreadCount = async (ctx) => {
  try {
    const userId = ctx.state.user.id;

    const count = await Notification.count({
      where: { userId, isRead: false }
    });

    success(ctx, { count });
  } catch (err) {
    error(ctx, err.message);
  }
};

module.exports = exports;
