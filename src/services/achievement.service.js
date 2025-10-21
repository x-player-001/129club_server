const { Achievement, UserAchievement, Notification, Match, MatchParticipant, Season, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Check and unlock achievements after match result is submitted
 * @param {string} userId - User ID
 * @param {string} matchId - Match ID
 * @returns {Array} Newly unlocked achievements
 */
exports.checkAndUnlockAchievements = async (userId, matchId) => {
  try {
    const match = await Match.findByPk(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    const seasonId = match.seasonId;
    const newAchievements = [];

    // Get all active achievements
    const achievements = await Achievement.findAll({
      where: { isActive: true }
    });

    // Check each achievement
    for (const achievement of achievements) {
      let unlocked = false;

      switch (achievement.code) {
        case 'hat_trick':
          unlocked = await checkHatTrick(userId, matchId, seasonId, achievement);
          break;
        case 'assist_king':
          unlocked = await checkAssistKing(userId, matchId, seasonId, achievement);
          break;
        case 'perfect_attendance':
          unlocked = await checkPerfectAttendance(userId, seasonId, achievement);
          break;
        case 'mvp_collector':
          unlocked = await checkMvpCollector(userId, seasonId, achievement);
          break;
        case 'goal_machine':
          unlocked = await checkGoalMachine(userId, seasonId, achievement);
          break;
        case 'winning_streak':
          unlocked = await checkWinningStreak(userId, seasonId, achievement);
          break;
      }

      if (unlocked) {
        newAchievements.push(unlocked);
      }
    }

    return newAchievements;
  } catch (error) {
    logger.error(`Check achievements failed: ${error.message}`);
    throw error;
  }
};

/**
 * Check Hat Trick achievement (3 goals in single match)
 */
async function checkHatTrick(userId, matchId, seasonId, achievement) {
  const participant = await MatchParticipant.findOne({
    where: { userId, matchId }
  });

  if (!participant || participant.goals < 3) {
    return null;
  }

  return await unlockAchievement(userId, achievement.id, seasonId, matchId, achievement);
}

/**
 * Check Assist King achievement (3 assists in single match)
 */
async function checkAssistKing(userId, matchId, seasonId, achievement) {
  const participant = await MatchParticipant.findOne({
    where: { userId, matchId }
  });

  if (!participant || participant.assists < 3) {
    return null;
  }

  return await unlockAchievement(userId, achievement.id, seasonId, matchId, achievement);
}

/**
 * Check Perfect Attendance achievement (100% attendance in season)
 */
async function checkPerfectAttendance(userId, seasonId, achievement) {
  if (!seasonId) return null;

  // Count total completed matches in season
  const totalMatches = await Match.count({
    where: {
      seasonId,
      status: 'completed'
    }
  });

  if (totalMatches === 0) return null;

  // Count user participated matches in season
  const userMatches = await MatchParticipant.count({
    include: [{
      model: Match,
      as: 'match',
      where: {
        seasonId,
        status: 'completed'
      },
      required: true
    }],
    where: { userId }
  });

  const attendance = (userMatches / totalMatches) * 100;

  if (attendance >= 100) {
    return await unlockAchievement(userId, achievement.id, seasonId, null, achievement);
  }

  return null;
}

/**
 * Check MVP Collector achievement (5 MVP in season)
 */
async function checkMvpCollector(userId, seasonId, achievement) {
  if (!seasonId) return null;

  const { MatchResult } = require('../models');

  // Get all matches in season
  const matches = await Match.findAll({
    where: {
      seasonId,
      status: 'completed'
    },
    include: [{
      model: MatchResult,
      as: 'result',
      required: false
    }]
  });

  let mvpCount = 0;
  for (const match of matches) {
    if (match.result && match.result.mvpUserIds) {
      const mvpUserIds = match.result.mvpUserIds;
      if (Array.isArray(mvpUserIds) && mvpUserIds.includes(userId)) {
        mvpCount++;
      }
    }
  }

  if (mvpCount >= 5) {
    return await unlockAchievement(userId, achievement.id, seasonId, null, achievement);
  }

  return null;
}

/**
 * Check Goal Machine achievement (10 goals in season)
 */
async function checkGoalMachine(userId, seasonId, achievement) {
  if (!seasonId) return null;

  const participants = await MatchParticipant.findAll({
    include: [{
      model: Match,
      as: 'match',
      where: {
        seasonId,
        status: 'completed'
      },
      required: true
    }],
    where: { userId }
  });

  const totalGoals = participants.reduce((sum, p) => sum + (p.goals || 0), 0);

  if (totalGoals >= 10) {
    return await unlockAchievement(userId, achievement.id, seasonId, null, achievement);
  }

  return null;
}

/**
 * Check Winning Streak achievement (3 consecutive wins)
 */
async function checkWinningStreak(userId, seasonId, achievement) {
  if (!seasonId) return null;

  const { MatchResult } = require('../models');

  // Get recent matches with results
  const participants = await MatchParticipant.findAll({
    include: [{
      model: Match,
      as: 'match',
      where: {
        seasonId,
        status: 'completed'
      },
      required: true,
      include: [{
        model: MatchResult,
        as: 'result',
        required: false
      }]
    }],
    where: { userId },
    order: [['match', 'matchDate', 'DESC']],
    limit: 10
  });

  // Check for 3 consecutive wins
  let consecutiveWins = 0;
  for (const participant of participants) {
    const match = participant.match;
    const result = match.result;

    if (!result) continue;

    const userTeam = participant.team;
    const isWin = (userTeam === 1 && result.team1Score > result.team2Score) ||
                  (userTeam === 2 && result.team2Score > result.team1Score);

    if (isWin) {
      consecutiveWins++;
      if (consecutiveWins >= 3) {
        return await unlockAchievement(userId, achievement.id, seasonId, null, achievement);
      }
    } else {
      consecutiveWins = 0;
    }
  }

  return null;
}

/**
 * Unlock achievement for user
 */
async function unlockAchievement(userId, achievementId, seasonId, matchId, achievement) {
  try {
    // Check if already unlocked
    const whereClause = {
      userId,
      achievementId
    };

    if (achievement.isSeasonBound) {
      whereClause.seasonId = seasonId;
    }

    let userAchievement = await UserAchievement.findOne({ where: whereClause });

    if (userAchievement) {
      // If repeatable, increment count
      if (achievement.isRepeatable) {
        await userAchievement.update({
          unlockCount: userAchievement.unlockCount + 1,
          unlockedAt: new Date(),
          matchId: matchId || userAchievement.matchId
        });

        // Create notification
        await createAchievementNotification(
          userId,
          achievement,
          `Congratulations! You have achieved ${achievement.name} for the ${userAchievement.unlockCount} time this season!`,
          { unlockCount: userAchievement.unlockCount }
        );

        return {
          ...achievement.toJSON(),
          unlockCount: userAchievement.unlockCount,
          isNew: false
        };
      }
      // Already unlocked and not repeatable
      return null;
    }

    // Create new achievement record
    userAchievement = await UserAchievement.create({
      id: uuidv4(),
      userId,
      achievementId,
      seasonId: achievement.isSeasonBound ? seasonId : null,
      matchId,
      unlockCount: 1
    });

    // Create notification
    await createAchievementNotification(
      userId,
      achievement,
      `Congratulations! You have unlocked the achievement: ${achievement.name}!`,
      { unlockCount: 1 }
    );

    return {
      ...achievement.toJSON(),
      unlockCount: 1,
      isNew: true
    };
  } catch (error) {
    logger.error(`Unlock achievement failed: ${error.message}`);
    return null;
  }
}

/**
 * Create achievement notification
 */
async function createAchievementNotification(userId, achievement, content, extraData) {
  try {
    await Notification.create({
      id: uuidv4(),
      userId,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      content,
      data: {
        achievementId: achievement.id,
        achievementCode: achievement.code,
        achievementName: achievement.name,
        achievementIcon: achievement.icon,
        ...extraData
      },
      isRead: false,
      isShown: false
    });
  } catch (error) {
    logger.error(`Create notification failed: ${error.message}`);
  }
}

/**
 * Get all achievements with user progress
 */
exports.getUserAchievementProgress = async (userId, seasonId) => {
  try {
    const achievements = await Achievement.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });

    const result = [];

    for (const achievement of achievements) {
      const whereClause = {
        userId,
        achievementId: achievement.id
      };

      if (achievement.isSeasonBound && seasonId) {
        whereClause.seasonId = seasonId;
      }

      const userAchievement = await UserAchievement.findOne({ where: whereClause });

      result.push({
        ...achievement.toJSON(),
        unlocked: !!userAchievement,
        unlockCount: userAchievement ? userAchievement.unlockCount : 0,
        unlockedAt: userAchievement ? userAchievement.unlockedAt : null
      });
    }

    return result;
  } catch (error) {
    logger.error(`Get user achievement progress failed: ${error.message}`);
    throw error;
  }
};

/**
 * Get user achievements (only unlocked)
 */
exports.getUserAchievements = async (userId, seasonId) => {
  try {
    const whereClause = { userId };
    if (seasonId) {
      whereClause.seasonId = seasonId;
    }

    const userAchievements = await UserAchievement.findAll({
      where: whereClause,
      include: [{
        model: Achievement,
        as: 'achievement'
      }],
      order: [['unlockedAt', 'DESC']]
    });

    return userAchievements.map(ua => ({
      ...ua.achievement.toJSON(),
      unlockCount: ua.unlockCount,
      unlockedAt: ua.unlockedAt,
      matchId: ua.matchId
    }));
  } catch (error) {
    logger.error(`Get user achievements failed: ${error.message}`);
    throw error;
  }
};

/**
 * Get all achievements
 */
exports.getAllAchievements = async () => {
  try {
    return await Achievement.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
  } catch (error) {
    logger.error(`Get all achievements failed: ${error.message}`);
    throw error;
  }
};

module.exports = exports;
