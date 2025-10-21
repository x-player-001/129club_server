const achievementService = require('../services/achievement.service');
const { success, error } = require('../utils/response');

/**
 * Get all achievements
 */
exports.getAllAchievements = async (ctx) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    success(ctx, achievements);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Get user achievement progress (all achievements with unlock status)
 */
exports.getUserProgress = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { seasonId } = ctx.query;

    const progress = await achievementService.getUserAchievementProgress(userId, seasonId);
    success(ctx, progress);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Get user unlocked achievements
 */
exports.getUserAchievements = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { seasonId } = ctx.query;

    const achievements = await achievementService.getUserAchievements(userId, seasonId);
    success(ctx, achievements);
  } catch (err) {
    error(ctx, err.message);
  }
};

/**
 * Manually trigger achievement check (admin only)
 */
exports.checkAchievements = async (ctx) => {
  try {
    const { userId } = ctx.params;
    const { matchId } = ctx.request.body;

    if (!matchId) {
      return error(ctx, 'Match ID is required');
    }

    const newAchievements = await achievementService.checkAndUnlockAchievements(userId, matchId);
    success(ctx, {
      newAchievements,
      count: newAchievements.length
    }, `Checked achievements, unlocked ${newAchievements.length} new achievement(s)`);
  } catch (err) {
    error(ctx, err.message);
  }
};

module.exports = exports;
