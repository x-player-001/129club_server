const { UserVisitLog, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 记录用户访问
 * @param {string} userId - 用户ID
 * @param {Object} visitInfo - 访问信息
 */
exports.recordVisit = async (userId, visitInfo = {}) => {
  try {
    // 检查用户是否存在
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      logger.warn(`User ${userId} not found, skip visit recording`);
      return {
        success: false,
        message: 'User not found',
        totalVisits: 0
      };
    }

    const {
      platform,
      appVersion,
      scene,
      ipAddress,
      deviceModel,
      systemVersion
    } = visitInfo;

    const today = new Date().toISOString().split('T')[0];

    // 创建访问日志
    const visitLog = await UserVisitLog.create({
      userId,
      visitDate: today,
      platform,
      appVersion,
      scene,
      ipAddress,
      deviceModel,
      systemVersion
    });

    logger.info(`User visit recorded: ${userId}, platform: ${platform}`);

    // 返回当前总访问次数
    const totalVisits = await UserVisitLog.count({ where: { userId } });

    return {
      success: true,
      visitTime: visitLog.visitTime,
      totalVisits
    };
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
    const startDateStr = startDate.toISOString().split('T')[0];

    // 1. 获取总访问次数和最后访问时间
    const totalStats = await UserVisitLog.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalVisits'],
        [sequelize.fn('MAX', sequelize.col('visit_time')), 'lastVisitAt']
      ],
      where: { userId },
      raw: true
    });

    // 2. 获取最近N天的访问记录
    const recentVisits = await UserVisitLog.findAll({
      where: {
        userId,
        visitDate: {
          [Op.gte]: startDateStr
        }
      },
      order: [['visit_time', 'DESC']]
    });

    // 3. 统计最近7天和30天的访问次数
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysStr = last7Days.toISOString().split('T')[0];

    const last7DaysCount = await UserVisitLog.count({
      where: {
        userId,
        visitDate: { [Op.gte]: last7DaysStr }
      }
    });

    const last30DaysCount = recentVisits.length;

    // 4. 按日期分组统计
    const dailyStatsMap = {};
    recentVisits.forEach(visit => {
      const date = visit.visitDate;
      if (!dailyStatsMap[date]) {
        dailyStatsMap[date] = 0;
      }
      dailyStatsMap[date]++;
    });

    const dailyStats = Object.entries(dailyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalVisits: parseInt(totalStats?.totalVisits) || 0,
      lastVisitAt: totalStats?.lastVisitAt || null,
      recentVisits: {
        last7Days: last7DaysCount,
        last30Days: last30DaysCount
      },
      dailyStats,
      visitList: recentVisits.slice(0, 20) // 最近20条
    };
  } catch (error) {
    logger.error(`Get visit stats failed: ${error.message}`);
    throw error;
  }
};

/**
 * 获取活跃用户统计（管理员）
 * @param {Object} params - 查询参数
 */
exports.getActiveUsersStats = async (params = {}) => {
  try {
    const { days = 7, limit = 20 } = params;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // 1. 统计活跃用户（在指定天数内有访问记录）
    const activeUsers = await UserVisitLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('UserVisitLog.id')), 'visitCount'],
        [sequelize.fn('MAX', sequelize.col('visit_time')), 'lastVisitAt']
      ],
      where: {
        visitDate: {
          [Op.gte]: startDateStr
        }
      },
      group: ['userId', 'user.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('UserVisitLog.id')), 'DESC']],
      limit: limit,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'realName', 'avatar']
      }],
      subQuery: false
    });

    // 2. 今日活跃用户数
    const today = new Date().toISOString().split('T')[0];
    const todayActiveCount = await UserVisitLog.count({
      distinct: true,
      col: 'user_id',
      where: { visitDate: today }
    });

    // 3. 格式化结果
    const formattedUsers = activeUsers.map(item => ({
      userId: item.userId,
      visitCount: parseInt(item.get('visitCount')),
      lastVisitAt: item.get('lastVisitAt'),
      user: item.user
    }));

    return {
      activeUserCount: activeUsers.length,
      todayActiveCount,
      activeUsers: formattedUsers
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
