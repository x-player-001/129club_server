/**
 * 身价控制器
 */

const valueService = require('../services/value.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 获取球员年度身价
 */
exports.getPlayerYearlyValue = async (ctx) => {
  try {
    const { userId } = ctx.params;
    const { clubYear } = ctx.query;

    const result = await valueService.getPlayerYearlyValue(
      userId,
      clubYear ? parseInt(clubYear) : null
    );

    success(ctx, result);
  } catch (err) {
    logger.error('getPlayerYearlyValue error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取当前用户的年度身价
 */
exports.getMyYearlyValue = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { clubYear } = ctx.query;

    const result = await valueService.getPlayerYearlyValue(
      userId,
      clubYear ? parseInt(clubYear) : null
    );

    success(ctx, result);
  } catch (err) {
    logger.error('getMyYearlyValue error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取年度身价排行榜
 */
exports.getYearlyValueRanking = async (ctx) => {
  try {
    const { clubYear, limit } = ctx.query;

    const result = await valueService.getYearlyValueRanking(
      clubYear ? parseInt(clubYear) : null,
      limit ? parseInt(limit) : 50
    );

    success(ctx, result);
  } catch (err) {
    logger.error('getYearlyValueRanking error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取球员身价明细记录
 */
exports.getPlayerValueRecords = async (ctx) => {
  try {
    const { userId } = ctx.params;
    const { clubYear, sourceType, page, pageSize } = ctx.query;

    const result = await valueService.getPlayerValueRecords(userId, {
      clubYear: clubYear ? parseInt(clubYear) : null,
      sourceType,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20
    });

    success(ctx, result);
  } catch (err) {
    logger.error('getPlayerValueRecords error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取当前用户的身价明细记录
 */
exports.getMyValueRecords = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { clubYear, sourceType, page, pageSize } = ctx.query;

    const result = await valueService.getPlayerValueRecords(userId, {
      clubYear: clubYear ? parseInt(clubYear) : null,
      sourceType,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20
    });

    success(ctx, result);
  } catch (err) {
    logger.error('getMyValueRecords error:', err);
    error(ctx, err.message);
  }
};

/**
 * 申报服务身价（需审核）
 */
exports.addServiceValue = async (ctx) => {
  try {
    const userId = ctx.state.user.id;
    const { clubYear, matchId, serviceType, count, notes } = ctx.request.body;

    if (!serviceType) {
      error(ctx, '请选择服务类型');
      return;
    }

    const validTypes = ['family', 'report', 'photo', 'invitation'];
    if (!validTypes.includes(serviceType)) {
      error(ctx, '无效的服务类型');
      return;
    }

    const result = await valueService.addServiceValue({
      userId,
      clubYear: clubYear ? parseInt(clubYear) : null,
      matchId,
      serviceType,
      count: count ? parseInt(count) : 1,
      notes
    });

    success(ctx, result, '服务身价已提交，等待审核');
  } catch (err) {
    logger.error('addServiceValue error:', err);
    error(ctx, err.message);
  }
};

/**
 * 添加特殊奖励（管理员）
 */
exports.addSpecialValue = async (ctx) => {
  try {
    const operatorId = ctx.state.user.id;
    const { userId, clubYear, amount, notes, matchId } = ctx.request.body;

    if (!userId) {
      error(ctx, '请选择球员');
      return;
    }

    if (!amount || amount === 0) {
      error(ctx, '奖励金额不能为0');
      return;
    }

    const result = await valueService.addSpecialValue({
      userId,
      clubYear: clubYear ? parseInt(clubYear) : null,
      amount: parseInt(amount),
      notes,
      matchId
    }, operatorId);

    success(ctx, result, '特殊奖励已添加');
  } catch (err) {
    logger.error('addSpecialValue error:', err);
    error(ctx, err.message);
  }
};

/**
 * 审核服务身价（管理员）
 */
exports.reviewServiceValue = async (ctx) => {
  try {
    const operatorId = ctx.state.user.id;
    const { valueId } = ctx.params;
    const { approved } = ctx.request.body;

    if (approved === undefined) {
      error(ctx, '请指定审核结果');
      return;
    }

    const result = await valueService.reviewServiceValue(
      valueId,
      approved,
      operatorId
    );

    success(ctx, result, approved ? '已通过审核' : '已驳回');
  } catch (err) {
    logger.error('reviewServiceValue error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取待审核的服务身价列表（管理员）
 */
exports.getPendingServiceValues = async (ctx) => {
  try {
    const { PlayerValue, User, Match } = require('../models');
    const { page = 1, pageSize = 20 } = ctx.query;

    const { count, rows } = await PlayerValue.findAndCountAll({
      where: {
        sourceType: 'service',
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber']
        },
        {
          model: Match,
          as: 'match',
          attributes: ['id', 'title', 'matchDate']
        }
      ],
      order: [['createdAt', 'ASC']],
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      limit: parseInt(pageSize)
    });

    success(ctx, {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize))
    });
  } catch (err) {
    logger.error('getPendingServiceValues error:', err);
    error(ctx, err.message);
  }
};

/**
 * 手动触发比赛身价计算（管理员）
 */
exports.recalculateMatchValues = async (ctx) => {
  try {
    const { matchId } = ctx.params;

    const result = await valueService.calculateMatchValues(matchId);

    success(ctx, result, '身价计算完成');
  } catch (err) {
    logger.error('recalculateMatchValues error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取当前俱乐部年度信息
 */
exports.getCurrentClubYear = async (ctx) => {
  try {
    const { ClubYear } = require('../models');

    const currentYear = valueService.getCurrentClubYear();

    const yearConfig = await ClubYear.findOne({
      where: { year: currentYear }
    });

    success(ctx, {
      currentYear,
      config: yearConfig,
      rules: valueService.VALUE_RULES
    });
  } catch (err) {
    logger.error('getCurrentClubYear error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取俱乐部年度列表
 */
exports.getClubYears = async (ctx) => {
  try {
    const { ClubYear } = require('../models');

    const years = await ClubYear.findAll({
      order: [['year', 'DESC']]
    });

    success(ctx, years);
  } catch (err) {
    logger.error('getClubYears error:', err);
    error(ctx, err.message);
  }
};
