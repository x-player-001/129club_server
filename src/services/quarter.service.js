const { Match, MatchQuarter, MatchEvent, MatchParticipant, MatchResult, User, Team } = require('../models');
const logger = require('../utils/logger');
const sequelize = require('../config/database');

/**
 * 4节制计分规则
 * 第1、2节获胜得1分，第3、4节获胜得2分
 */
const QUARTER_POINTS = {
  1: { win: 1, draw: 0 },
  2: { win: 1, draw: 0 },
  3: { win: 2, draw: 0 },
  4: { win: 2, draw: 0 }
};

/**
 * 计算单节得分
 */
function calculateQuarterPoints(quarterNumber, team1Goals, team2Goals) {
  const rule = QUARTER_POINTS[quarterNumber];

  if (team1Goals > team2Goals) {
    return { team1Points: rule.win, team2Points: 0 };
  } else if (team2Goals > team1Goals) {
    return { team1Points: 0, team2Points: rule.win };
  } else {
    return { team1Points: rule.draw, team2Points: rule.draw };
  }
}

/**
 * 根据事件列表自动统计进球数
 * @param {Array} events 事件列表（MatchEvent实例或普通对象）
 * @param {string} team1Id 队伍1的ID
 * @param {string} team2Id 队伍2的ID
 * @returns {Object} { team1Goals, team2Goals }
 */
function calculateGoalsFromEvents(events, team1Id, team2Id) {
  let team1Goals = 0;
  let team2Goals = 0;

  events.forEach(event => {
    // 只统计进球事件
    if (event.eventType === 'goal') {
      const eventTeamId = event.teamId;

      // 判断是否为乌龙球
      const isOwnGoal = event.eventSubtype === 'own_goal';

      if (isOwnGoal) {
        // 乌龙球：teamId 代表得分方（受益方），进球直接计入该队
        // 前端约定：勾选"乌龙"时，teamId选择得分的队伍，userId选择踢乌龙的球员
        if (eventTeamId === team1Id) {
          team1Goals++; // teamId是队伍1，队伍1得分
        } else if (eventTeamId === team2Id) {
          team2Goals++; // teamId是队伍2，队伍2得分
        }
      } else {
        // 正常进球：teamId 代表进球方，进球计入该队
        if (eventTeamId === team1Id) {
          team1Goals++;
        } else if (eventTeamId === team2Id) {
          team2Goals++;
        }
      }
    }
  });

  return { team1Goals, team2Goals };
}

/**
 * 录入单个节次数据（支持碎片化录入）
 * @param {string} matchId 比赛ID
 * @param {Object} data 节次数据
 * @param {string} userId 操作用户ID
 *
 * 支持三种模式：
 * - mode: 'overwrite' (默认) - 覆盖模式，清空该节次所有旧事件，重新录入（适合批量录入/修正错误）
 * - mode: 'append' - 追加模式，保留旧事件，只添加新事件（适合实时碎片化录入）
 * - mode: 'auto' - 自动模式，根据事件自动统计比分（不需要手动传team1Goals/team2Goals）
 */
exports.submitQuarter = async (matchId, data, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      quarterNumber,
      team1Goals,
      team2Goals,
      events = [],
      summary,
      mode = 'overwrite', // 默认覆盖模式，保持向后兼容
      isCompleted = false, // 是否标记该节次为已完成（默认false，进行中）
      deleteEventIds = [] // 要删除的事件ID列表（仅在append/auto模式下生效）
    } = data;

    // 验证比赛存在且为4节制
    const match = await Match.findByPk(matchId, { transaction });
    if (!match) {
      throw new Error('比赛不存在');
    }
    if (!match.quarterSystem) {
      throw new Error('该比赛不是4节制');
    }

    let finalTeam1Goals = team1Goals;
    let finalTeam2Goals = team2Goals;
    let deletedEventCount = 0;

    // 处理事件录入
    let createdEvents = [];

    if (mode === 'overwrite') {
      // 覆盖模式：删除旧事件，重新创建
      await MatchEvent.destroy({
        where: { matchId, quarterNumber },
        transaction
      });

      for (const event of events) {
        const matchEvent = await MatchEvent.create({
          matchId,
          quarterNumber,
          teamId: event.teamId,
          userId: event.userId,
          eventType: event.eventType,
          eventSubtype: event.eventSubtype,
          minute: event.minute,
          assistUserId: event.assistUserId,
          notes: event.notes,
          recordedBy: userId
        }, { transaction });
        createdEvents.push(matchEvent);
      }

      logger.info(`Overwrite mode: deleted old events and created ${createdEvents.length} new events`);
    } else if (mode === 'append' || mode === 'auto') {
      // 追加模式：先处理删除，再添加新事件

      // 1. 删除指定的事件
      if (deleteEventIds && deleteEventIds.length > 0) {
        const deleteResult = await MatchEvent.destroy({
          where: {
            id: deleteEventIds,
            matchId,
            quarterNumber
          },
          transaction
        });
        deletedEventCount = deleteResult;
        logger.info(`Deleted ${deletedEventCount} events for quarter ${quarterNumber}`);
      }

      // 2. 添加新事件
      for (const event of events) {
        const matchEvent = await MatchEvent.create({
          matchId,
          quarterNumber,
          teamId: event.teamId,
          userId: event.userId,
          eventType: event.eventType,
          eventSubtype: event.eventSubtype,
          minute: event.minute,
          assistUserId: event.assistUserId,
          notes: event.notes,
          recordedBy: userId
        }, { transaction });
        createdEvents.push(matchEvent);
      }

      logger.info(`Append mode: deleted ${deletedEventCount} events, added ${createdEvents.length} new events`);
    } else {
      throw new Error(`不支持的模式: ${mode}，支持的模式为: overwrite, append, auto`);
    }

    // auto模式：根据事件自动统计比分（在事件录入后计算）
    if (mode === 'auto') {
      const allEvents = await MatchEvent.findAll({
        where: { matchId, quarterNumber },
        transaction
      });

      const calculated = calculateGoalsFromEvents(allEvents, match.team1Id, match.team2Id);
      finalTeam1Goals = calculated.team1Goals;
      finalTeam2Goals = calculated.team2Goals;

      logger.info(`Auto calculated goals for quarter ${quarterNumber}: ${finalTeam1Goals}-${finalTeam2Goals}`);
    }

    // 计算本节得分
    const { team1Points, team2Points } = calculateQuarterPoints(quarterNumber, finalTeam1Goals, finalTeam2Goals);

    // 确定节次状态
    // overwrite模式默认标记为completed（因为是一次性录完整节）
    // append/auto模式根据isCompleted参数决定
    let status = 'in_progress';
    if (mode === 'overwrite') {
      status = 'completed'; // overwrite模式默认完成
    } else if (isCompleted) {
      status = 'completed'; // append/auto模式由前端控制
    }

    // 创建或更新节次记录
    const [quarter, created] = await MatchQuarter.upsert({
      matchId,
      quarterNumber,
      team1Goals: finalTeam1Goals,
      team2Goals: finalTeam2Goals,
      team1Points,
      team2Points,
      summary: summary || null,
      status
    }, { transaction });

    // 更新比赛总得分
    await updateMatchFinalScore(matchId, transaction);

    await transaction.commit();

    logger.info(`Quarter ${quarterNumber} submitted for match ${matchId} (mode: ${mode}, deleted: ${deletedEventCount}, created: ${createdEvents.length})`);

    return {
      quarter,
      events: createdEvents,
      deletedEventCount,
      mode,
      currentScore: await getMatchCurrentScore(matchId)
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Submit quarter failed:', error);
    throw error;
  }
};

/**
 * 批量录入完整4节比赛
 */
exports.submitCompleteQuarters = async (matchId, data, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const { quarters, participants, mvpUserIds = [], summary } = data;

    // 验证比赛
    const match = await Match.findByPk(matchId, { transaction });
    if (!match) {
      throw new Error('比赛不存在');
    }
    if (!match.quarterSystem) {
      throw new Error('该比赛不是4节制');
    }

    // 逐个录入节次
    let team1TotalGoals = 0;
    let team2TotalGoals = 0;
    const quarterRecords = [];

    for (const quarterData of quarters) {
      const { quarterNumber, team1Goals, team2Goals, summary: quarterSummary, events = [] } = quarterData;

      team1TotalGoals += team1Goals;
      team2TotalGoals += team2Goals;

      const { team1Points, team2Points } = calculateQuarterPoints(quarterNumber, team1Goals, team2Goals);

      const quarter = await MatchQuarter.create({
        matchId,
        quarterNumber,
        team1Goals,
        team2Goals,
        team1Points,
        team2Points,
        summary: quarterSummary,
        status: 'completed' // 批量录入默认标记为已完成
      }, { transaction });

      quarterRecords.push(quarter);

      // 创建事件
      for (const event of events) {
        await MatchEvent.create({
          matchId,
          quarterNumber,
          teamId: event.teamId,
          userId: event.userId,
          eventType: event.eventType,
          eventSubtype: event.eventSubtype,
          minute: event.minute,
          assistUserId: event.assistUserId,
          notes: event.notes,
          recordedBy: userId
        }, { transaction });
      }
    }

    // 更新比赛总得分
    const { team1FinalScore, team2FinalScore } = await updateMatchFinalScore(matchId, transaction);

    // 添加到场人员
    if (participants) {
      if (participants.team1) {
        for (const userId of participants.team1) {
          await MatchParticipant.create({
            matchId,
            teamId: match.team1Id,
            userId,
            isPresent: true
          }, { transaction });
        }
      }
      if (participants.team2) {
        for (const userId of participants.team2) {
          await MatchParticipant.create({
            matchId,
            teamId: match.team2Id,
            userId,
            isPresent: true
          }, { transaction });
        }
      }
    }

    // 创建比赛结果
    const winnerTeamId = team1FinalScore > team2FinalScore ? match.team1Id :
                        (team2FinalScore > team1FinalScore ? match.team2Id : null);

    const result = await MatchResult.create({
      matchId,
      team1Score: team1TotalGoals,
      team2Score: team2TotalGoals,
      quarterSystem: true,
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals,
      winnerTeamId,
      mvpUserId: mvpUserIds[0] || null,
      summary,
      submittedBy: userId
    }, { transaction });

    // 更新比赛状态
    await match.update({ status: 'completed' }, { transaction });

    await transaction.commit();

    logger.info(`Complete quarters submitted for match ${matchId}`);

    return {
      quarters: quarterRecords,
      result,
      finalScore: { team1FinalScore, team2FinalScore, team1TotalGoals, team2TotalGoals }
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Submit complete quarters failed:', error);
    throw error;
  }
};

/**
 * 更新比赛总得分（4节累计）
 */
async function updateMatchFinalScore(matchId, transaction) {
  const quarters = await MatchQuarter.findAll({
    where: { matchId },
    transaction
  });

  let team1FinalScore = 0;
  let team2FinalScore = 0;

  quarters.forEach(q => {
    team1FinalScore += q.team1Points;
    team2FinalScore += q.team2Points;
  });

  await Match.update(
    { finalTeam1Score: team1FinalScore, finalTeam2Score: team2FinalScore },
    { where: { id: matchId }, transaction }
  );

  return { team1FinalScore, team2FinalScore };
}

/**
 * 获取比赛当前得分
 */
async function getMatchCurrentScore(matchId) {
  const quarters = await MatchQuarter.findAll({
    where: { matchId },
    order: [['quarterNumber', 'ASC']]
  });

  let team1FinalScore = 0;
  let team2FinalScore = 0;
  let team1TotalGoals = 0;
  let team2TotalGoals = 0;
  let completedCount = 0;

  quarters.forEach(q => {
    team1FinalScore += q.team1Points;
    team2FinalScore += q.team2Points;
    team1TotalGoals += q.team1Goals;
    team2TotalGoals += q.team2Goals;

    // 只统计已完成的节次
    if (q.status === 'completed') {
      completedCount++;
    }
  });

  return {
    team1FinalScore,
    team2FinalScore,
    team1TotalGoals,
    team2TotalGoals,
    quartersCompleted: completedCount // 只统计已完成的节次数
  };
}

/**
 * 获取比赛详情（含节次）
 */
exports.getMatchWithQuarters = async (matchId) => {
  const match = await Match.findByPk(matchId, {
    include: [
      {
        model: Team,
        as: 'team1',
        attributes: ['id', 'name', 'logo', 'color']
      },
      {
        model: Team,
        as: 'team2',
        attributes: ['id', 'name', 'logo', 'color']
      },
      {
        model: MatchQuarter,
        as: 'quarters',
        order: [['quarterNumber', 'ASC']]
      },
      {
        model: MatchEvent,
        as: 'events',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'realName', 'avatar']
          },
          {
            model: User,
            as: 'assistUser',
            attributes: ['id', 'nickname', 'realName']
          }
        ],
        order: [['quarterNumber', 'ASC'], ['minute', 'ASC']]
      },
      {
        model: MatchParticipant,
        as: 'participants',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'realName', 'avatar']
          }
        ]
      },
      {
        model: MatchResult,
        as: 'result'
      }
    ]
  });

  if (!match) {
    return null;
  }

  // 按队伍分组到场人员
  const participants = {
    team1: [],
    team2: []
  };

  if (match.participants) {
    match.participants.forEach(p => {
      if (p.teamId === match.team1Id) {
        participants.team1.push(p);
      } else if (p.teamId === match.team2Id) {
        participants.team2.push(p);
      }
    });
  }

  // 计算已完成的节次数
  let quartersCompleted = 0;
  if (match.quarters) {
    quartersCompleted = match.quarters.filter(q => q.status === 'completed').length;
  }

  return {
    ...match.toJSON(),
    participants,
    quartersCompleted
  };
};

/**
 * 获取球员比赛统计
 */
exports.getPlayerMatchStats = async (matchId) => {
  const events = await MatchEvent.findAll({
    where: { matchId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'realName', 'avatar']
      }
    ]
  });

  const stats = {};

  events.forEach(event => {
    const userId = event.userId;

    if (!stats[userId]) {
      stats[userId] = {
        userId,
        user: event.user,
        goals: 0,
        assists: 0,
        saves: 0,
        refereeCount: 0,
        yellowCards: 0,
        redCards: 0,
        quarters: new Set()
      };
    }

    stats[userId].quarters.add(event.quarterNumber);

    switch (event.eventType) {
      case 'goal':
        stats[userId].goals++;
        break;
      case 'assist':
        stats[userId].assists++;
        break;
      case 'save':
        stats[userId].saves++;
        break;
      case 'referee':
        stats[userId].refereeCount++;
        break;
      case 'yellow_card':
        stats[userId].yellowCards++;
        break;
      case 'red_card':
        stats[userId].redCards++;
        break;
    }
  });

  // 转换为数组并添加助攻统计
  const result = Object.values(stats).map(s => ({
    ...s,
    quarters: Array.from(s.quarters).sort()
  }));

  return result;
};



/**
 * 补充4节制比赛结果信息（MVP、照片、总结）并完成比赛
 * @param {string} matchId 比赛ID
 * @param {Object} data 补充数据
 * @param {string} userId 提交者ID
 */
exports.supplementQuarterResult = async (matchId, data, userId) => {
  const { mvpUserIds, summary } = data;

  // 验证比赛
  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }
  if (!match.quarterSystem) {
    throw new Error('该比赛不是4节制');
  }

  // 检查是否已录入4节数据
  const quarters = await MatchQuarter.findAll({
    where: { matchId },
    order: [['quarterNumber', 'ASC']]
  });

  if (quarters.length !== 4) {
    throw new Error(`比赛只录入了${quarters.length}节数据，请先录入完整4节数据`);
  }

  // 检查是否所有节次都已完成
  const incompletedQuarters = quarters.filter(q => q.status !== 'completed');
  if (incompletedQuarters.length > 0) {
    throw new Error(`还有${incompletedQuarters.length}个节次未完成，请先完成所有节次`);
  }

  // 计算总得分
  const { team1FinalScore, team2FinalScore, team1TotalGoals, team2TotalGoals } =
    await getMatchCurrentScore(matchId);

  // 判断获胜队伍
  const winnerTeamId = team1FinalScore > team2FinalScore ? match.team1Id :
                      (team2FinalScore > team1FinalScore ? match.team2Id : null);

  // 查找或创建 match_results 记录
  let result = await MatchResult.findOne({ where: { matchId } });

  if (result) {
    // 更新现有记录（不更新photos，photos由上传接口管理）
    await result.update({
      mvpUserIds: mvpUserIds || result.mvpUserIds,
      summary: summary || result.summary,
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals,
      winnerTeamId,
      submittedBy: userId,
      submittedAt: new Date()
    });
  } else {
    // 创建新记录（不设置photos，photos由上传接口管理）
    result = await MatchResult.create({
      matchId,
      quarterSystem: true,
      team1Score: team1TotalGoals,
      team2Score: team2TotalGoals,
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals,
      winnerTeamId,
      mvpUserIds: mvpUserIds || null,
      summary: summary || null,
      submittedBy: userId,
      submittedAt: new Date()
    });
  }

  // 更新比赛状态为已完成
  if (match.status !== 'completed') {
    await match.update({ status: 'completed' });
  }

  logger.info(`Quarter match result supplemented: ${matchId}, status: completed, mvps: ${mvpUserIds ? mvpUserIds.length : 0}`);

  // Check achievements for all participants
  const achievementService = require('./achievement.service');
  const participants = await MatchParticipant.findAll({ where: { matchId } });

  const newAchievementsMap = {};
  for (const participant of participants) {
    try {
      const userNewAchievements = await achievementService.checkAndUnlockAchievements(
        participant.userId,
        matchId
      );
      if (userNewAchievements.length > 0) {
        newAchievementsMap[participant.userId] = userNewAchievements;
      }
    } catch (error) {
      logger.error(`Achievement check failed for user ${participant.userId}: ${error.message}`);
    }
  }

  return {
    result,
    match,
    quarters,
    score: {
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals
    },
    newAchievements: newAchievementsMap
  };
};


module.exports = exports;
