/**
 * 身价计算服务
 * 负责计算和管理球员身价
 */

const { Op } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

// 身价规则配置（单位：万）
const VALUE_RULES = {
  // 出勤身价
  attendance: {
    base: 100,              // 基础出勤 100万（外战翻倍）
    outsidePlayerBonus: 1000 // 外地球员额外 +1000万/场（固定，不翻倍）
  },
  // 角色身价（每节）
  role: {
    goalkeeper: 50,         // 守门 50万/节（外战翻倍）
    referee: 50             // 裁判 50万/节（包括边裁，不翻倍）
  },
  // 战绩身价
  result: {
    winPool: 500,           // 胜利奖池 500万/场（到场者平分，不翻倍）
    drawPool: 200,          // 平局奖池 200万/场（到场者平分，不翻倍）
    mvp: 50                 // MVP 50万（外战翻倍）
  },
  // 数据身价（仅外战，不额外翻倍）
  data: {
    goal: 50,               // 进球 50万/个
    assist: 50              // 助攻 50万/次
  },
  // 处罚（扣分）
  penalty: {
    yellowCard: -50,        // 黄牌扣 50万
    redCard: -100           // 红牌扣 100万
  },
  // 服务身价
  service: {
    family: 50,             // 带家属/拉拉队 50万/人次
    report: 100,            // 写战报 100万
    photo: 200,             // 拍照或录像上传 200万
    invitation: 200         // 邀约外战 200万
  },
  // 外战倍率（只有部分奖励翻倍：出勤、门将、MVP）
  externalMultiplier: 2
};

/**
 * 根据比赛日期获取俱乐部年度
 * 年度以每年12月9日为分界点
 * @param {Date} matchDate 比赛日期
 * @returns {number} 俱乐部年度
 */
function getClubYearFromDate(matchDate) {
  const date = new Date(matchDate);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const year = date.getFullYear();

  // 俱乐部成立于2013年12月9日，第1年为 2013.12.9 - 2014.12.8
  const baseYear = 2013;

  // 判断是在12月9日之前还是之后
  if (month > 12 || (month === 12 && day >= 9)) {
    // 12月9日及之后，属于新年度
    return year - baseYear + 1;
  } else {
    // 12月9日之前，属于上一年度
    return year - baseYear;
  }
}

/**
 * 获取当前俱乐部年度
 * @returns {number} 当前俱乐部年度
 */
function getCurrentClubYear() {
  return getClubYearFromDate(new Date());
}

/**
 * 计算比赛相关的身价（出勤、角色、战绩、数据）
 * 幂等操作：先删除该比赛的旧记录，再重新计算
 * @param {string} matchId 比赛ID
 */
async function calculateMatchValues(matchId) {
  const { Match, MatchParticipant, MatchQuarter, MatchEvent, MatchResult, User, PlayerValue, PlayerYearlyValue } = require('../models');

  const transaction = await sequelize.transaction();

  try {
    // 1. 获取比赛信息
    const match = await Match.findByPk(matchId, { transaction });
    if (!match) {
      throw new Error('比赛不存在');
    }

    if (match.status !== 'completed') {
      logger.info(`Match ${matchId} is not completed, skipping value calculation`);
      await transaction.commit();
      return { skipped: true, reason: 'match not completed' };
    }

    const isExternal = match.matchType === 'external';
    const externalMultiplier = VALUE_RULES.externalMultiplier;
    const clubYear = getClubYearFromDate(match.matchDate);

    logger.info(`Calculating values for match ${matchId}, type: ${match.matchType}, clubYear: ${clubYear}`);

    // 2. 删除该比赛的所有旧身价记录（幂等）
    await PlayerValue.destroy({
      where: { matchId },
      transaction
    });

    // 3. 获取所有到场球员（只统计到场人员，不统计报名但未到场的）
    const participants = await MatchParticipant.findAll({
      where: {
        matchId,
        isPresent: true  // 只获取到场人员
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'isOutsidePlayer', 'position']
      }],
      transaction
    });

    if (participants.length === 0) {
      logger.warn(`No participants found for match ${matchId}`);
      await transaction.commit();
      return { skipped: true, reason: 'no participants' };
    }

    // 4. 获取比赛结果
    const matchResult = await MatchResult.findOne({
      where: { matchId },
      transaction
    });

    // 5. 获取所有节次数据（用于角色身价）
    const quarters = await MatchQuarter.findAll({
      where: { matchId },
      transaction
    });

    // 6. 获取所有比赛事件（用于数据身价）
    const events = await MatchEvent.findAll({
      where: { matchId },
      transaction
    });

    // 7. 计算每个球员的身价
    const valueRecords = [];
    const affectedUserIds = new Set();

    for (const participant of participants) {
      const userId = participant.userId;
      const teamId = participant.teamId;
      const user = participant.user;
      affectedUserIds.add(userId);

      // 7.1 出勤身价（外战翻倍）
      const attendanceBase = VALUE_RULES.attendance.base;
      const attendanceMultiplier = isExternal ? externalMultiplier : 1;
      const attendanceFinal = attendanceBase * attendanceMultiplier;

      valueRecords.push({
        userId,
        clubYear,
        matchId,
        seasonId: match.seasonId,
        sourceType: 'attendance',
        sourceDetail: isExternal ? '出勤（外战）' : '出勤',
        baseAmount: attendanceBase,
        multiplier: attendanceMultiplier,
        finalAmount: attendanceFinal,
        status: 'auto'
      });

      // 外地球员额外奖励（固定1000万，不受翻倍影响）
      if (user && user.isOutsidePlayer) {
        valueRecords.push({
          userId,
          clubYear,
          matchId,
          seasonId: match.seasonId,
          sourceType: 'attendance',
          sourceDetail: '外地球员奖励',
          baseAmount: VALUE_RULES.attendance.outsidePlayerBonus,
          multiplier: 1,
          finalAmount: VALUE_RULES.attendance.outsidePlayerBonus,
          status: 'auto'
        });
      }

      // 7.2 角色身价（守门和裁判）
      for (const quarter of quarters) {
        // 守门员（外战翻倍）
        if (quarter.team1GoalkeeperId === userId || quarter.team2GoalkeeperId === userId) {
          const goalkeeperMultiplier = isExternal ? externalMultiplier : 1;
          valueRecords.push({
            userId,
            clubYear,
            matchId,
            seasonId: match.seasonId,
            sourceType: 'role',
            sourceDetail: `守门第${quarter.quarterNumber}节${isExternal ? '（外战）' : ''}`,
            baseAmount: VALUE_RULES.role.goalkeeper,
            multiplier: goalkeeperMultiplier,
            finalAmount: VALUE_RULES.role.goalkeeper * goalkeeperMultiplier,
            status: 'auto'
          });
        }

        // 裁判（主裁+边裁，不翻倍）
        if (quarter.mainRefereeId === userId ||
            quarter.assistantReferee1Id === userId ||
            quarter.assistantReferee2Id === userId) {
          valueRecords.push({
            userId,
            clubYear,
            matchId,
            seasonId: match.seasonId,
            sourceType: 'role',
            sourceDetail: `裁判第${quarter.quarterNumber}节`,
            baseAmount: VALUE_RULES.role.referee,
            multiplier: 1,
            finalAmount: VALUE_RULES.role.referee,
            status: 'auto'
          });
        }
      }

      // 7.3 MVP奖励（外战翻倍）
      if (matchResult && matchResult.mvpUserIds && matchResult.mvpUserIds.includes(userId)) {
        const mvpMultiplier = isExternal ? externalMultiplier : 1;
        valueRecords.push({
          userId,
          clubYear,
          matchId,
          seasonId: match.seasonId,
          sourceType: 'result',
          sourceDetail: `MVP${isExternal ? '（外战）' : ''}`,
          baseAmount: VALUE_RULES.result.mvp,
          multiplier: mvpMultiplier,
          finalAmount: VALUE_RULES.result.mvp * mvpMultiplier,
          status: 'auto'
        });
      }

      // 7.4 数据身价（仅外战）
      if (isExternal) {
        // 统计进球（排除乌龙球）
        const goals = events.filter(e =>
          e.userId === userId &&
          e.eventType === 'goal' &&
          e.eventSubtype !== 'own_goal'
        ).length;

        if (goals > 0) {
          valueRecords.push({
            userId,
            clubYear,
            matchId,
            seasonId: match.seasonId,
            sourceType: 'data',
            sourceDetail: `进球x${goals}`,
            baseAmount: VALUE_RULES.data.goal * goals,
            multiplier: 1, // 外战数据身价不再额外翻倍（规则里已经说是外战专属）
            finalAmount: VALUE_RULES.data.goal * goals,
            status: 'auto'
          });
        }

        // 统计助攻
        const assists = events.filter(e =>
          e.assistUserId === userId &&
          e.eventType === 'goal'
        ).length;

        if (assists > 0) {
          valueRecords.push({
            userId,
            clubYear,
            matchId,
            seasonId: match.seasonId,
            sourceType: 'data',
            sourceDetail: `助攻x${assists}`,
            baseAmount: VALUE_RULES.data.assist * assists,
            multiplier: 1,
            finalAmount: VALUE_RULES.data.assist * assists,
            status: 'auto'
          });
        }
      }

      // 7.5 黄红牌扣分
      const yellowCards = events.filter(e =>
        e.userId === userId && e.eventType === 'yellow_card'
      ).length;

      const redCards = events.filter(e =>
        e.userId === userId && e.eventType === 'red_card'
      ).length;

      if (yellowCards > 0) {
        valueRecords.push({
          userId,
          clubYear,
          matchId,
          seasonId: match.seasonId,
          sourceType: 'result',
          sourceDetail: `黄牌x${yellowCards}`,
          baseAmount: VALUE_RULES.penalty.yellowCard * yellowCards,
          multiplier: 1,
          finalAmount: VALUE_RULES.penalty.yellowCard * yellowCards,
          status: 'auto'
        });
      }

      if (redCards > 0) {
        valueRecords.push({
          userId,
          clubYear,
          matchId,
          seasonId: match.seasonId,
          sourceType: 'result',
          sourceDetail: `红牌x${redCards}`,
          baseAmount: VALUE_RULES.penalty.redCard * redCards,
          multiplier: 1,
          finalAmount: VALUE_RULES.penalty.redCard * redCards,
          status: 'auto'
        });
      }
    }

    // 7.6 胜负平奖励（奖池平分给到场者）
    if (matchResult && participants.length > 0) {
      const isDraw = matchResult.winnerTeamId === null;
      const participantCount = participants.length;

      if (isDraw) {
        // 平局：200万奖池平分给所有到场者
        const drawRewardPerPerson = Math.floor(VALUE_RULES.result.drawPool / participantCount);
        for (const participant of participants) {
          valueRecords.push({
            userId: participant.userId,
            clubYear,
            matchId,
            seasonId: match.seasonId,
            sourceType: 'result',
            sourceDetail: `平局奖励(${participantCount}人平分)`,
            baseAmount: VALUE_RULES.result.drawPool,
            multiplier: 1 / participantCount,
            finalAmount: drawRewardPerPerson,
            status: 'auto'
          });
        }
      } else {
        // 胜利：500万奖池平分给获胜队伍的到场者
        const winnerTeamId = matchResult.winnerTeamId;
        const winningParticipants = participants.filter(p => p.teamId === winnerTeamId);
        const winnerCount = winningParticipants.length;

        if (winnerCount > 0) {
          const winRewardPerPerson = Math.floor(VALUE_RULES.result.winPool / winnerCount);
          for (const participant of winningParticipants) {
            valueRecords.push({
              userId: participant.userId,
              clubYear,
              matchId,
              seasonId: match.seasonId,
              sourceType: 'result',
              sourceDetail: `胜利奖励(${winnerCount}人平分)`,
              baseAmount: VALUE_RULES.result.winPool,
              multiplier: 1 / winnerCount,
              finalAmount: winRewardPerPerson,
              status: 'auto'
            });
          }
        }
      }
    }

    // 8. 批量插入身价记录
    if (valueRecords.length > 0) {
      await PlayerValue.bulkCreate(valueRecords, { transaction });
      logger.info(`Created ${valueRecords.length} value records for match ${matchId}`);
    }

    // 9. 更新受影响球员的年度汇总
    for (const userId of affectedUserIds) {
      await updatePlayerYearlySummary(userId, clubYear, transaction);
    }

    await transaction.commit();

    logger.info(`Value calculation completed for match ${matchId}`);

    return {
      success: true,
      matchId,
      clubYear,
      isExternal,
      recordsCreated: valueRecords.length,
      playersAffected: affectedUserIds.size
    };

  } catch (error) {
    await transaction.rollback();
    logger.error(`Value calculation failed for match ${matchId}:`, error);
    throw error;
  }
}

/**
 * 更新球员年度身价汇总
 * @param {string} userId 球员ID
 * @param {number} clubYear 俱乐部年度
 * @param {Transaction} transaction 事务
 */
async function updatePlayerYearlySummary(userId, clubYear, transaction) {
  const { PlayerValue, PlayerYearlyValue, Match } = require('../models');

  // 统计各类型身价
  const stats = await PlayerValue.findAll({
    where: {
      userId,
      clubYear,
      status: { [Op.in]: ['auto', 'approved'] }
    },
    attributes: [
      'sourceType',
      [sequelize.fn('SUM', sequelize.col('final_amount')), 'total']
    ],
    group: ['sourceType'],
    raw: true,
    transaction
  });

  const valueByType = {};
  let totalValue = 0;

  for (const stat of stats) {
    valueByType[stat.sourceType] = parseInt(stat.total) || 0;
    totalValue += parseInt(stat.total) || 0;
  }

  // 统计参赛场次
  const matchStats = await PlayerValue.findAll({
    where: {
      userId,
      clubYear,
      sourceType: 'attendance',
      status: { [Op.in]: ['auto', 'approved'] }
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('match_id'))), 'matchCount']
    ],
    raw: true,
    transaction
  });

  const matchCount = parseInt(matchStats[0]?.matchCount) || 0;

  // 统计外战场次
  const externalMatchStats = await sequelize.query(`
    SELECT COUNT(DISTINCT pv.match_id) as count
    FROM player_values pv
    JOIN matches m ON pv.match_id = m.id
    WHERE pv.user_id = :userId
      AND pv.club_year = :clubYear
      AND pv.source_type = 'attendance'
      AND pv.status IN ('auto', 'approved')
      AND m.match_type = 'external'
  `, {
    replacements: { userId, clubYear },
    type: sequelize.QueryTypes.SELECT,
    transaction
  });

  const externalMatchCount = parseInt(externalMatchStats[0]?.count) || 0;

  // 更新或创建汇总记录
  const [summary, created] = await PlayerYearlyValue.findOrCreate({
    where: { userId, clubYear },
    defaults: {
      totalValue: 0,
      attendanceValue: 0,
      roleValue: 0,
      resultValue: 0,
      dataValue: 0,
      serviceValue: 0,
      specialValue: 0,
      matchCount: 0,
      externalMatchCount: 0
    },
    transaction
  });

  await summary.update({
    totalValue,
    attendanceValue: valueByType.attendance || 0,
    roleValue: valueByType.role || 0,
    resultValue: valueByType.result || 0,
    dataValue: valueByType.data || 0,
    serviceValue: valueByType.service || 0,
    specialValue: valueByType.special || 0,
    matchCount,
    externalMatchCount
  }, { transaction });

  logger.info(`Updated yearly summary for user ${userId}, year ${clubYear}: total=${totalValue}`);
}

/**
 * 获取球员年度身价详情
 * @param {string} userId 球员ID
 * @param {number} clubYear 俱乐部年度（可选，默认当前年度）
 */
async function getPlayerYearlyValue(userId, clubYear = null) {
  const { PlayerYearlyValue, PlayerValue, User, ClubYear } = require('../models');

  const year = clubYear || getCurrentClubYear();

  // 获取汇总数据
  const summary = await PlayerYearlyValue.findOne({
    where: { userId, clubYear: year },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber']
    }]
  });

  // 获取年度配置（留队线等）
  const yearConfig = await ClubYear.findOne({
    where: { year }
  });

  const stayLine = yearConfig?.stayLine || 5000;
  const totalValue = summary?.totalValue || 0;

  return {
    userId,
    clubYear: year,
    user: summary?.user || null,
    totalValue,
    breakdown: {
      attendance: summary?.attendanceValue || 0,
      role: summary?.roleValue || 0,
      result: summary?.resultValue || 0,
      data: summary?.dataValue || 0,
      service: summary?.serviceValue || 0,
      special: summary?.specialValue || 0
    },
    matchCount: summary?.matchCount || 0,
    externalMatchCount: summary?.externalMatchCount || 0,
    stayLine,
    isQualified: totalValue >= stayLine,
    gap: Math.max(0, stayLine - totalValue)
  };
}

/**
 * 获取年度身价排行榜
 * @param {number} clubYear 俱乐部年度（可选，默认当前年度）
 * @param {number} limit 返回数量限制
 */
async function getYearlyValueRanking(clubYear = null, limit = 50) {
  const { PlayerYearlyValue, User, ClubYear } = require('../models');

  const year = clubYear || getCurrentClubYear();

  const rankings = await PlayerYearlyValue.findAll({
    where: { clubYear: year },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber', 'currentTeamId']
    }],
    order: [['totalValue', 'DESC']],
    limit
  });

  // 获取年度配置
  const yearConfig = await ClubYear.findOne({
    where: { year }
  });

  const stayLine = yearConfig?.stayLine || 5000;

  return {
    clubYear: year,
    stayLine,
    rankings: rankings.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      user: r.user,
      totalValue: r.totalValue,
      matchCount: r.matchCount,
      externalMatchCount: r.externalMatchCount,
      isQualified: r.totalValue >= stayLine,
      breakdown: {
        attendance: r.attendanceValue,
        role: r.roleValue,
        result: r.resultValue,
        data: r.dataValue,
        service: r.serviceValue,
        special: r.specialValue
      }
    }))
  };
}

/**
 * 获取球员身价明细记录
 * @param {string} userId 球员ID
 * @param {Object} options 查询选项
 */
async function getPlayerValueRecords(userId, options = {}) {
  const { PlayerValue, Match, Season } = require('../models');

  const { clubYear, sourceType, page = 1, pageSize = 20 } = options;

  const where = { userId };

  if (clubYear) {
    where.clubYear = clubYear;
  }

  if (sourceType) {
    where.sourceType = sourceType;
  }

  const { count, rows } = await PlayerValue.findAndCountAll({
    where,
    include: [
      {
        model: Match,
        as: 'match',
        attributes: ['id', 'title', 'matchDate', 'matchType']
      },
      {
        model: Season,
        as: 'season',
        attributes: ['id', 'name']
      }
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

/**
 * 添加服务身价（需审核）
 * @param {Object} data 服务身价数据
 */
async function addServiceValue(data) {
  const { PlayerValue } = require('../models');

  const { userId, clubYear, matchId, serviceType, count = 1, notes } = data;

  const year = clubYear || getCurrentClubYear();

  // 获取服务类型对应的身价
  const serviceAmount = VALUE_RULES.service[serviceType];
  if (!serviceAmount) {
    throw new Error(`未知的服务类型: ${serviceType}`);
  }

  const serviceLabels = {
    family: '带家属/拉拉队',
    report: '写战报',
    photo: '拍照/录像上传',
    invitation: '邀约外战'
  };

  const record = await PlayerValue.create({
    userId,
    clubYear: year,
    matchId: matchId || null,
    sourceType: 'service',
    sourceDetail: `${serviceLabels[serviceType]}${count > 1 ? `x${count}` : ''}`,
    baseAmount: serviceAmount * count,
    multiplier: 1,
    finalAmount: serviceAmount * count,
    status: 'pending', // 需要审核
    notes
  });

  logger.info(`Service value added for user ${userId}: ${serviceType}, amount: ${serviceAmount * count}`);

  return record;
}

/**
 * 添加特殊奖励（管理员直接添加，无需审核）
 * @param {Object} data 特殊奖励数据
 * @param {string} operatorId 操作者ID
 */
async function addSpecialValue(data, operatorId) {
  const { PlayerValue } = require('../models');

  const { userId, clubYear, amount, notes, matchId } = data;

  const year = clubYear || getCurrentClubYear();

  if (!amount || amount === 0) {
    throw new Error('奖励金额不能为0');
  }

  const transaction = await sequelize.transaction();

  try {
    const record = await PlayerValue.create({
      userId,
      clubYear: year,
      matchId: matchId || null,
      sourceType: 'special',
      sourceDetail: notes || '特殊贡献奖励',
      baseAmount: Math.abs(amount),
      multiplier: amount > 0 ? 1 : -1,
      finalAmount: amount,
      status: 'auto', // 管理员添加直接生效，无需审核
      notes
    }, { transaction });

    // 更新年度汇总
    await updatePlayerYearlySummary(userId, year, transaction);

    await transaction.commit();

    logger.info(`Special value added for user ${userId}: amount=${amount}, by ${operatorId}`);

    return record;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * 审核服务身价
 * @param {string} valueId 身价记录ID
 * @param {boolean} approved 是否通过
 * @param {string} operatorId 操作者ID
 */
async function reviewServiceValue(valueId, approved, operatorId) {
  const { PlayerValue } = require('../models');

  const transaction = await sequelize.transaction();

  try {
    const record = await PlayerValue.findByPk(valueId, { transaction });

    if (!record) {
      throw new Error('记录不存在');
    }

    if (record.status !== 'pending') {
      throw new Error('该记录已审核');
    }

    await record.update({
      status: approved ? 'approved' : 'rejected',
      approvedBy: operatorId,
      approvedAt: new Date()
    }, { transaction });

    // 如果通过，更新年度汇总
    if (approved) {
      await updatePlayerYearlySummary(record.userId, record.clubYear, transaction);
    }

    await transaction.commit();

    logger.info(`Value ${valueId} ${approved ? 'approved' : 'rejected'} by ${operatorId}`);

    return record;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * 初始化俱乐部年度配置
 */
async function initClubYears() {
  const { ClubYear } = require('../models');

  const years = [
    { year: 11, name: '第11年', startDate: '2023-12-09', endDate: '2024-12-08', stayLine: 5000 },
    { year: 12, name: '第12年', startDate: '2024-12-09', endDate: '2025-12-08', stayLine: 5000, isActive: true },
    { year: 13, name: '第13年', startDate: '2025-12-09', endDate: '2026-12-08', stayLine: 5000 }
  ];

  for (const yearData of years) {
    await ClubYear.findOrCreate({
      where: { year: yearData.year },
      defaults: yearData
    });
  }

  logger.info('Club years initialized');
}

module.exports = {
  VALUE_RULES,
  getClubYearFromDate,
  getCurrentClubYear,
  calculateMatchValues,
  updatePlayerYearlySummary,
  getPlayerYearlyValue,
  getYearlyValueRanking,
  getPlayerValueRecords,
  addServiceValue,
  addSpecialValue,
  reviewServiceValue,
  initClubYears
};
