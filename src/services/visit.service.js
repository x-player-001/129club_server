const { UserVisitLog, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * 记录用户访问
 * @param {string} userId - 用户ID
 * @param {Object} visitInfo - 访问信息
 */
exports.recordVisit = async (userId, visitInfo = {}) => {
  try {
    const {
      platform,
      appVersion,
      scene,
      ipAddress,
      deviceModel,
      systemVersion
    } = visitInfo;

    const today = new Date().toISOString().split('T')[0];

    // 1. 创建访问日志
    await UserVisitLog.create({
      userId,
      visitDate: today,
      platform,
      appVersion,
      scene,
      ipAddress,
      deviceModel,
      systemVersion
    });

    // 2. 更新用户表的访问统计
    const user = await User.findByPk(userId);
    if (user) {
      await user.update({
        lastVisitAt: new Date(),
        visitCount: (user.visitCount || 0) + 1
      });
    }

    logger.info(`User visit recorded: ${userId}, platform: ${platform}`);
    return { success: true };
  } catch (error) {
    logger.error(`Record visit failed: ${error.message}`);
    throw error;
  }
};

/**
 * 获取用户访问统计
 * @param {string} userId - 用户ID
 * @param {Object} params - 查询参数
 */
exports.getUserVisitStats = async (userId, params = {}) => {
  try {
    const { days = 30 } = params;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 查询指定天数内的访问记录
    const visits = await UserVisitLog.findAll({
      where: {
        userId,
        visitDate: {
          [Op.gte]: startDate.toISOString().split('T')[0]
        }
      },
      order: [['visit_time', 'DESC']]
    });

    // 按日期分组统计
    const dailyStats = {};
    visits.forEach(visit => {
      const date = visit.visitDate;
      if (!dailyStats[date]) {
        dailyStats[date] = 0;
      }
      dailyStats[date]++;
    });

    // 获取用户总访问次数
    const user = await User.findByPk(userId, {
      attributes: ['visitCount', 'lastVisitAt']
    });

    return {
      totalVisits: user?.visitCount || 0,
      lastVisitAt: user?.lastVisitAt,
      recentVisits: visits.length,
      dailyStats,
      visitList: visits.slice(0, 10) // 最近10条
    };
  } catch (error) {
    logger.error(`Get visit stats failed: ${error.message}`);
    throw error;
  }
};

/**
 * 获取活跃用户统计
 * @param {Object} params - 查询参数
 */
exports.getActiveUsersStats = async (params = {}) => {
  try {
    const { days = 7 } = params;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 统计活跃用户（在指定天数内有访问记录）
    const activeUsers = await UserVisitLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'visitCount'],
        [sequelize.fn('MAX', sequelize.col('visit_time')), 'lastVisit']
      ],
      where: {
        visitDate: {
          [Op.gte]: startDate.toISOString().split('T')[0]
        }
      },
      group: ['userId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['nickname', 'realName', 'avatar']
      }]
    });

    // 今日活跃用户
    const today = new Date().toISOString().split('T')[0];
    const todayActiveCount = await UserVisitLog.count({
      distinct: true,
      col: 'user_id',
      where: { visitDate: today }
    });

    return {
      activeUserCount: activeUsers.length,
      todayActiveCount,
      activeUsers: activeUsers.slice(0, 50) // 前50名
    };
  } catch (error) {
    logger.error(`Get active users stats failed: ${error.message}`);
    throw error;
  }
};

/**
 * 清理旧访问日志
 * @param {number} keepDays - 保留天数（默认90天）
 */
exports.cleanOldVisitLogs = async (keepDays = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    const deleted = await UserVisitLog.destroy({
      where: {
        visitDate: {
          [Op.lt]: cutoffDate.toISOString().split('T')[0]
        }
      }
    });

    logger.info(`Cleaned ${deleted} old visit logs (older than ${keepDays} days)`);
    return { deleted };
  } catch (error) {
    logger.error(`Clean old logs failed: ${error.message}`);
    throw error;
  }
};

module.exports = exports;
