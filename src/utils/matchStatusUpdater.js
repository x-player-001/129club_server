const Match = require('../models/Match');
const logger = require('./logger');

/**
 * 根据时间自动更新比赛状态
 * @param {string} matchId 比赛ID
 * @returns {Promise<boolean>} 是否更新了状态
 */
async function autoUpdateMatchStatus(matchId) {
  try {
    const match = await Match.findByPk(matchId);

    if (!match) {
      return false;
    }

    const now = new Date();
    const matchDate = new Date(match.matchDate);
    const registrationDeadline = match.registrationDeadline ? new Date(match.registrationDeadline) : null;

    let updated = false;
    let oldStatus = match.status;

    // 状态转换规则
    switch (match.status) {
      case 'registration':
        // 报名中 → 阵容已设置（如果已过报名截止时间）
        if (registrationDeadline && now > registrationDeadline) {
          await match.update({ status: 'lineup_set' });
          updated = true;
          logger.info(`Match ${matchId} status updated: registration → lineup_set (报名截止时间已到)`);
        }
        // 报名中 → 进行中（如果已过比赛开始时间且没有报名截止时间）
        else if (!registrationDeadline && now > matchDate) {
          await match.update({ status: 'in_progress' });
          updated = true;
          logger.info(`Match ${matchId} status updated: registration → in_progress (比赛已开始)`);
        }
        break;

      case 'lineup_set':
        // 阵容已设置 → 进行中（如果已过比赛开始时间）
        if (now > matchDate) {
          await match.update({ status: 'in_progress' });
          updated = true;
          logger.info(`Match ${matchId} status updated: lineup_set → in_progress (比赛已开始)`);
        }
        break;

      case 'upcoming':
        // 即将开始 → 报名中（如果有报名截止时间且未到）
        if (registrationDeadline && now < registrationDeadline) {
          await match.update({ status: 'registration' });
          updated = true;
          logger.info(`Match ${matchId} status updated: upcoming → registration (开放报名)`);
        }
        // 即将开始 → 进行中（如果已过比赛开始时间）
        else if (now > matchDate) {
          await match.update({ status: 'in_progress' });
          updated = true;
          logger.info(`Match ${matchId} status updated: upcoming → in_progress (比赛已开始)`);
        }
        break;

      // completed 和 cancelled 状态不自动更新
      default:
        break;
    }

    if (updated) {
      logger.info(`✅ Match status auto-updated: ${matchId} (${oldStatus} → ${match.status})`);
    }

    return updated;

  } catch (error) {
    logger.error(`Error auto-updating match status for ${matchId}:`, error);
    return false;
  }
}

/**
 * 批量更新即将开始的比赛状态
 * 用于比赛列表接口，避免更新所有比赛
 */
async function autoUpdateUpcomingMatches() {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1小时前

    // 只更新即将开始（1小时内）的比赛
    const upcomingMatches = await Match.findAll({
      where: {
        status: ['registration', 'lineup_set', 'upcoming'],
        matchDate: {
          [require('sequelize').Op.gte]: oneHourAgo, // 比赛时间在1小时前到未来
          [require('sequelize').Op.lte]: now // 比赛时间在当前时间之前
        }
      }
    });

    let updatedCount = 0;
    for (const match of upcomingMatches) {
      const updated = await autoUpdateMatchStatus(match.id);
      if (updated) updatedCount++;
    }

    if (updatedCount > 0) {
      logger.info(`🔄 Batch updated ${updatedCount} match statuses`);
    }

    return updatedCount;

  } catch (error) {
    logger.error('Error batch updating match statuses:', error);
    return 0;
  }
}

module.exports = {
  autoUpdateMatchStatus,
  autoUpdateUpcomingMatches
};
