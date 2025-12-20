const { Match, MatchQuarter, MatchEvent, MatchParticipant, MatchResult, User, Team } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const sequelize = require('../config/database');

/**
 * 4节制计分规则
 * 第1、2、3节获胜各得1分，第4节获胜得2分
 */
const QUARTER_POINTS = {
  1: { win: 1, draw: 0 },
  2: { win: 1, draw: 0 },
  3: { win: 1, draw: 0 },
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
        attributes: ['id', 'name', 'logo', 'color', 'jerseyImage']
      },
      {
        model: Team,
        as: 'team2',
        attributes: ['id', 'name', 'logo', 'color', 'jerseyImage']
      },
      {
        model: MatchQuarter,
        as: 'quarters',
        include: [
          {
            model: User,
            as: 'mainReferee',
            attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
            required: false
          },
          {
            model: User,
            as: 'assistantReferee1',
            attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
            required: false
          },
          {
            model: User,
            as: 'assistantReferee2',
            attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
            required: false
          },
          {
            model: User,
            as: 'team1Goalkeeper',
            attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
            required: false
          },
          {
            model: User,
            as: 'team2Goalkeeper',
            attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
            required: false
          }
        ],
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
  const { mvpUserIds, summary, penaltyShootout } = data;

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

  // 判断获胜队伍（考虑点球大战）
  let winnerTeamId = null;
  let penaltyWinnerTeamId = null;

  if (team1FinalScore > team2FinalScore) {
    winnerTeamId = match.team1Id;
  } else if (team2FinalScore > team1FinalScore) {
    winnerTeamId = match.team2Id;
  } else {
    // 平局，检查是否有点球大战
    if (penaltyShootout && penaltyShootout.team1PenaltyScore !== undefined && penaltyShootout.team2PenaltyScore !== undefined) {
      if (penaltyShootout.team1PenaltyScore > penaltyShootout.team2PenaltyScore) {
        penaltyWinnerTeamId = match.team1Id;
        winnerTeamId = match.team1Id;  // 最终获胜者为点球获胜方
      } else if (penaltyShootout.team2PenaltyScore > penaltyShootout.team1PenaltyScore) {
        penaltyWinnerTeamId = match.team2Id;
        winnerTeamId = match.team2Id;  // 最终获胜者为点球获胜方
      }
    }
    // 如果没有点球或点球也平局（理论上不会），winnerTeamId 保持为 null
  }

  // 查找或创建 match_results 记录
  let result = await MatchResult.findOne({ where: { matchId } });

  // 保存旧结果用于回滚统计（如果是更新操作）
  let oldResult = null;
  if (result) {
    oldResult = {
      winnerTeamId: result.winnerTeamId,
      team1TotalGoals: result.team1TotalGoals,
      team2TotalGoals: result.team2TotalGoals,
      team1FinalScore: result.team1FinalScore,
      team2FinalScore: result.team2FinalScore
    };
  }

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
      penaltyShootout: penaltyShootout ? true : false,
      team1PenaltyScore: penaltyShootout ? penaltyShootout.team1PenaltyScore : null,
      team2PenaltyScore: penaltyShootout ? penaltyShootout.team2PenaltyScore : null,
      penaltyWinnerTeamId: penaltyWinnerTeamId,
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
      penaltyShootout: penaltyShootout ? true : false,
      team1PenaltyScore: penaltyShootout ? penaltyShootout.team1PenaltyScore : null,
      team2PenaltyScore: penaltyShootout ? penaltyShootout.team2PenaltyScore : null,
      penaltyWinnerTeamId: penaltyWinnerTeamId,
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

  // 更新队伍统计数据（如果是修改操作，需要传入旧结果以回滚）
  logger.info(`[supplementQuarterResult] Starting updateTeamStats for match ${matchId}`);
  await updateTeamStats(match, result, oldResult);
  logger.info(`[supplementQuarterResult] Completed updateTeamStats for match ${matchId}`);

  // 更新球员统计数据
  logger.info(`[supplementQuarterResult] Starting updatePlayerStats for match ${matchId}`);
  await updatePlayerStats(matchId);
  logger.info(`[supplementQuarterResult] Completed updatePlayerStats for match ${matchId}`);

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


/**
 * 更新队伍统计数据
 * @param {Object} match - 比赛对象
 * @param {Object} result - 新的比赛结果
 * @param {Object} oldResult - 旧的比赛结果（如果是修改操作）
 */
async function updateTeamStats(match, result, oldResult = null) {
  const { TeamStat, Season, MatchQuarter } = require('../models');

  logger.info(`[updateTeamStats] Starting for match ${match.id}, seasonId: ${match.seasonId}`);

  // 获取赛季信息
  const season = await Season.findByPk(match.seasonId);
  const seasonId = match.seasonId;
  const seasonName = season ? season.name : '未知赛季';

  logger.info(`[updateTeamStats] Season found: id=${seasonId}, name="${seasonName}"`);

  // 获取所有节次数据以计算实际进球数
  const quarters = await MatchQuarter.findAll({
    where: { matchId: match.id },
    order: [['quarter_number', 'ASC']]
  });

  // 计算总进球数
  let team1Goals = 0;
  let team2Goals = 0;

  quarters.forEach(quarter => {
    team1Goals += quarter.team1Goals || 0;
    team2Goals += quarter.team2Goals || 0;
  });

  // 如果是修改操作，先回滚旧的统计数据
  if (oldResult) {
    logger.info(`Rolling back old stats for match ${match.id}`);
    // 回滚队伍1旧统计（减去旧数据）
    await updateSingleTeamStats(
      match.team1Id,
      seasonId,
      match.team1Id === oldResult.winnerTeamId,
      oldResult.winnerTeamId === null,
      oldResult.team1TotalGoals || 0,
      oldResult.team2TotalGoals || 0,
      true // 表示是回滚操作
    );

    // 回滚队伍2旧统计（减去旧数据）
    await updateSingleTeamStats(
      match.team2Id,
      seasonId,
      match.team2Id === oldResult.winnerTeamId,
      oldResult.winnerTeamId === null,
      oldResult.team2TotalGoals || 0,
      oldResult.team1TotalGoals || 0,
      true // 表示是回滚操作
    );
  }

  // 更新队伍1统计（添加新数据）
  await updateSingleTeamStats(match.team1Id, seasonId, match.team1Id === result.winnerTeamId, result.winnerTeamId === null, team1Goals, team2Goals, false);

  // 更新队伍2统计（添加新数据）
  await updateSingleTeamStats(match.team2Id, seasonId, match.team2Id === result.winnerTeamId, result.winnerTeamId === null, team2Goals, team1Goals, false);
}

/**
 * 更新单个队伍的统计数据
 * @param {string} teamId - 队伍ID
 * @param {string} seasonId - 赛季ID
 * @param {boolean} isWin - 是否获胜
 * @param {boolean} isDraw - 是否平局
 * @param {number} goalsFor - 进球数
 * @param {number} goalsAgainst - 失球数
 * @param {boolean} isRollback - 是否是回滚操作（减去统计）
 */
async function updateSingleTeamStats(teamId, seasonId, isWin, isDraw, goalsFor, goalsAgainst, isRollback = false) {
  const { TeamStat } = require('../models');

  logger.info(`[updateSingleTeamStats] teamId=${teamId}, seasonId=${seasonId}, isWin=${isWin}, isDraw=${isDraw}, isRollback=${isRollback}`);

  const [teamStat, created] = await TeamStat.findOrCreate({
    where: { teamId, season: seasonId },
    defaults: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      winRate: '0.00'
    }
  });

  logger.info(`[updateSingleTeamStats] findOrCreate result: created=${created}`);

  // 如果是回滚操作，减去统计；否则增加统计
  const delta = isRollback ? -1 : 1;

  // 更新统计
  teamStat.matchesPlayed += delta;

  if (isWin) {
    teamStat.wins += delta;
    teamStat.points += delta * 3;
  } else if (isDraw) {
    teamStat.draws += delta;
    teamStat.points += delta * 1;
  } else {
    teamStat.losses += delta;
  }

  teamStat.goalsFor += delta * goalsFor;
  teamStat.goalsAgainst += delta * goalsAgainst;
  teamStat.goalDifference = teamStat.goalsFor - teamStat.goalsAgainst;

  // 避免除以0
  if (teamStat.matchesPlayed > 0) {
    teamStat.winRate = ((teamStat.wins / teamStat.matchesPlayed) * 100).toFixed(2);
  } else {
    teamStat.winRate = '0.00';
  }

  await teamStat.save();

  const operation = isRollback ? 'rolled back' : 'updated';
  logger.info(`Team stats ${operation} for team ${teamId}: ${teamStat.wins}W ${teamStat.draws}D ${teamStat.losses}L (${teamStat.matchesPlayed} matches)`);
}

/**
 * 重新计算单个球员的统计数据（幂等操作）
 */
async function recalculatePlayerStats(userId) {
  const { PlayerStat, MatchEvent, MatchParticipant, MatchResult, User, Match } = require('../models');

  // 获取该球员所有参与的比赛
  const allParticipations = await MatchParticipant.findAll({
    where: { userId }
  });

  // 获取该球员所有比赛事件
  const allEvents = await MatchEvent.findAll({
    where: { userId }
  });

  // 统计进球和助攻（排除乌龙球，乌龙球不计入个人进球）
  let totalGoals = 0;
  let totalAssists = 0;

  allEvents.forEach(event => {
    if (event.eventType === 'goal' && event.eventSubtype !== 'own_goal') {
      totalGoals += 1;
    }
  });

  // 统计作为助攻者的次数
  const assistEvents = await MatchEvent.findAll({
    where: {
      assistUserId: userId,
      eventType: 'goal'
    }
  });
  totalAssists = assistEvents.length;

  // 统计MVP次数：查询match_result表中mvpUserIds包含该userId的比赛数
  const mvpCount = await MatchResult.count({
    where: sequelize.where(
      sequelize.fn('JSON_CONTAINS', sequelize.col('mvp_user_ids'), sequelize.fn('JSON_QUOTE', userId)),
      1
    )
  });

  // 计算胜负数据
  let wins = 0;
  let draws = 0;
  let losses = 0;

  for (const participation of allParticipations) {
    // 获取该场比赛的信息和结果
    const participationMatch = await Match.findByPk(participation.matchId);

    if (!participationMatch || participationMatch.status !== 'completed') {
      continue; // 跳过未完成的比赛
    }

    const participationResult = await MatchResult.findOne({
      where: { matchId: participation.matchId }
    });

    // 判断球员所在队伍的胜负
    // 优先检查是否有点球大战或明确的胜者
    if (participationResult && participationResult.winnerTeamId) {
      // 有明确的胜者（可能通过点球决出）
      if (participationResult.winnerTeamId === participation.teamId) {
        wins++;
      } else {
        losses++;
      }
      continue;
    }

    // 没有明确胜者，通过比分判断
    let myScore, opponentScore;

    if (participation.teamId === participationMatch.team1Id) {
      // 球员在队伍1
      if (participationMatch.quarterSystem && participationResult) {
        // 4节制：使用 team1FinalScore (节次比分)
        myScore = participationResult.team1FinalScore !== null ? participationResult.team1FinalScore : participationResult.team1Score;
        opponentScore = participationResult.team2FinalScore !== null ? participationResult.team2FinalScore : participationResult.team2Score;
      } else {
        // 非4节制：使用 matches 表的 finalTeam1Score
        myScore = participationMatch.finalTeam1Score || 0;
        opponentScore = participationMatch.finalTeam2Score || 0;
      }
    } else if (participation.teamId === participationMatch.team2Id) {
      // 球员在队伍2
      if (participationMatch.quarterSystem && participationResult) {
        // 4节制：使用 team2FinalScore (节次比分)
        myScore = participationResult.team2FinalScore !== null ? participationResult.team2FinalScore : participationResult.team2Score;
        opponentScore = participationResult.team1FinalScore !== null ? participationResult.team1FinalScore : participationResult.team1Score;
      } else {
        // 非4节制：使用 matches 表的 finalTeam2Score
        myScore = participationMatch.finalTeam2Score || 0;
        opponentScore = participationMatch.finalTeam1Score || 0;
      }
    } else {
      continue; // 队伍不匹配，跳过
    }

    // 统计胜负平
    if (myScore > opponentScore) {
      wins++;
    } else if (myScore === opponentScore) {
      draws++;
    } else {
      losses++;
    }
  }

  // 计算胜率
  const totalMatches = wins + draws + losses;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : '0.00';

  // 找到或创建球员统计记录
  const [playerStat, created] = await PlayerStat.findOrCreate({
    where: { userId },
    defaults: {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: '0.00',
      attendanceRate: '0.00',
      mvpCount: 0
    }
  });

  // 直接设置为正确的值（幂等操作）
  playerStat.matchesPlayed = allParticipations.length;
  playerStat.goals = totalGoals;
  playerStat.assists = totalAssists;
  playerStat.mvpCount = mvpCount;
  playerStat.wins = wins;
  playerStat.draws = draws;
  playerStat.losses = losses;
  playerStat.winRate = winRate;

  // 计算出勤率（按队伍计算）
  const user = await User.findByPk(userId, {
    attributes: ['currentTeamId']
  });

  if (user && user.currentTeamId) {
    // 统计该队伍参加的已完成比赛总数
    const teamMatchCount = await Match.count({
      where: {
        status: 'completed',
        [Op.or]: [
          { team1Id: user.currentTeamId },
          { team2Id: user.currentTeamId }
        ]
      }
    });

    if (teamMatchCount > 0) {
      // 出勤率 = 球员参赛场次 / 队伍总比赛数 × 100
      playerStat.attendanceRate = ((playerStat.matchesPlayed / teamMatchCount) * 100).toFixed(2);
    }
  }

  await playerStat.save();

  logger.info(`Player stats recalculated for user ${userId}: ${playerStat.matchesPlayed} matches, ${totalGoals} goals, ${totalAssists} assists, ${mvpCount} MVPs, attendance: ${playerStat.attendanceRate}%`);

  // ========== 更新 PlayerTeamStat（分赛季统计） ==========
  const { PlayerTeamStat, Team, Season } = require('../models');

  // 获取该球员参与的所有队伍-赛季组合
  const teamSeasonCombos = await sequelize.query(`
    SELECT DISTINCT
      mp.team_id,
      m.season_id
    FROM match_participants mp
    JOIN matches m ON mp.match_id = m.id
    WHERE mp.user_id = :userId
      AND m.status = 'completed'
  `, {
    replacements: { userId },
    type: sequelize.QueryTypes.SELECT
  });

  // 为每个队伍-赛季组合计算统计数据
  for (const combo of teamSeasonCombos) {
    const { team_id: teamId, season_id: seasonId } = combo;

    // 获取该球员在该队伍、该赛季的所有参赛记录
    const seasonParticipations = await MatchParticipant.findAll({
      where: { userId, teamId },
      include: [{
        model: Match,
        as: 'match',
        where: {
          status: 'completed',
          seasonId: combo.season_id
        },
        required: true
      }]
    });

    if (seasonParticipations.length === 0) continue;

    // 统计该赛季的进球和助攻
    let seasonGoals = 0;
    let seasonAssists = 0;

    for (const participation of seasonParticipations) {
      const matchId = participation.matchId;

      // 统计进球（排除乌龙球）
      const goals = await MatchEvent.count({
        where: {
          matchId,
          userId,
          eventType: 'goal',
          [Op.or]: [
            { eventSubtype: null },
            { eventSubtype: { [Op.ne]: 'own_goal' } }
          ]
        }
      });
      seasonGoals += goals;

      // 统计助攻
      const assists = await MatchEvent.count({
        where: {
          matchId,
          assistUserId: userId,
          eventType: 'goal'
        }
      });
      seasonAssists += assists;
    }

    // 统计MVP次数
    const seasonMvpCount = await MatchResult.count({
      where: sequelize.where(
        sequelize.literal(`JSON_CONTAINS(mvp_user_ids, JSON_QUOTE('${userId}')) AND match_id IN (
          SELECT m.id FROM matches m
          JOIN match_participants mp ON m.id = mp.match_id
          WHERE mp.user_id = '${userId}'
            AND mp.team_id = '${teamId}'
            AND m.season_id = '${combo.season_id}'
            AND m.status = 'completed'
        )`),
        1
      )
    });

    // 统计胜负数据
    let seasonWins = 0;
    let seasonDraws = 0;
    let seasonLosses = 0;

    for (const participation of seasonParticipations) {
      const participationMatch = participation.match;
      const participationResult = await MatchResult.findOne({
        where: { matchId: participation.matchId }
      });

      // 判断胜负（使用与总统计相同的逻辑）
      if (participationResult && participationResult.winnerTeamId) {
        if (participationResult.winnerTeamId === teamId) {
          seasonWins++;
        } else {
          seasonLosses++;
        }
        continue;
      }

      let myScore, opponentScore;
      if (teamId === participationMatch.team1Id) {
        if (participationMatch.quarterSystem && participationResult) {
          myScore = participationResult.team1FinalScore !== null ? participationResult.team1FinalScore : participationResult.team1Score;
          opponentScore = participationResult.team2FinalScore !== null ? participationResult.team2FinalScore : participationResult.team2Score;
        } else {
          myScore = participationMatch.finalTeam1Score || 0;
          opponentScore = participationMatch.finalTeam2Score || 0;
        }
      } else if (teamId === participationMatch.team2Id) {
        if (participationMatch.quarterSystem && participationResult) {
          myScore = participationResult.team2FinalScore !== null ? participationResult.team2FinalScore : participationResult.team2Score;
          opponentScore = participationResult.team1FinalScore !== null ? participationResult.team1FinalScore : participationResult.team1Score;
        } else {
          myScore = participationMatch.finalTeam2Score || 0;
          opponentScore = participationMatch.finalTeam1Score || 0;
        }
      } else {
        continue;
      }

      if (myScore > opponentScore) {
        seasonWins++;
      } else if (myScore === opponentScore) {
        seasonDraws++;
      } else {
        seasonLosses++;
      }
    }

    // 获取赛季名称用于 season 字段（VARCHAR）
    const season = await Season.findByPk(seasonId);
    if (!season) {
      logger.warn(`Season ${seasonId} not found, skipping PlayerTeamStat update`);
      continue;
    }

    logger.info(`Season found: id=${seasonId}, name="${season.name}"`);

    const replacements = {
      userId,
      teamId,
      seasonName: season.name,
      seasonId,
      matchesPlayed: seasonParticipations.length,
      wins: seasonWins,
      draws: seasonDraws,
      losses: seasonLosses,
      goals: seasonGoals,
      assists: seasonAssists,
      mvpCount: seasonMvpCount
    };

    logger.info(`SQL replacements: ${JSON.stringify(replacements)}`);

    // 使用原始 SQL 的 INSERT ... ON DUPLICATE KEY UPDATE 来避免 Sequelize 字段映射问题
    try {
      await sequelize.query(`
        INSERT INTO player_team_stats (
          id, user_id, team_id, season, season_id,
          matches_played, wins, draws, losses, goals, assists,
          yellow_cards, red_cards, mvp_count, updated_at
        ) VALUES (
          UUID(), :userId, :teamId, :seasonName, :seasonId,
          :matchesPlayed, :wins, :draws, :losses, :goals, :assists,
          0, 0, :mvpCount, NOW()
        )
        ON DUPLICATE KEY UPDATE
          season = :seasonName,
          matches_played = :matchesPlayed,
          wins = :wins,
          draws = :draws,
          losses = :losses,
          goals = :goals,
          assists = :assists,
          mvp_count = :mvpCount,
          updated_at = NOW()
      `, {
        replacements,
        type: sequelize.QueryTypes.INSERT
      });

      logger.info(`PlayerTeamStat updated for user ${userId}, team ${teamId}, season ${seasonId}: ${seasonParticipations.length} matches, ${seasonGoals}G ${seasonAssists}A`);
    } catch (error) {
      logger.error(`Failed to update PlayerTeamStat for user ${userId}, team ${teamId}, season ${seasonId}`);
      logger.error(`SQL Error: ${error.message}`);
      logger.error(`Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}

/**
 * 更新球员统计数据（为所有参赛球员重新计算，并更新整个队伍所有球员的出勤率）
 */
async function updatePlayerStats(matchId) {
  const { MatchParticipant, User, PlayerStat } = require('../models');

  logger.info(`[updatePlayerStats] Starting for match ${matchId}`);

  // 获取比赛信息
  const match = await Match.findByPk(matchId);
  if (!match) {
    logger.warn(`[updatePlayerStats] Match ${matchId} not found`);
    return;
  }

  // 获取到场人员
  const participants = await MatchParticipant.findAll({
    where: { matchId }
  });

  logger.info(`[updatePlayerStats] Found ${participants.length} participants for match ${matchId}`);

  // 为每个参赛球员重新计算统计数据（包括进球、助攻、MVP、出勤率）
  for (const participant of participants) {
    logger.info(`[updatePlayerStats] Recalculating stats for user ${participant.userId}`);
    await recalculatePlayerStats(participant.userId);
    logger.info(`[updatePlayerStats] Completed recalculation for user ${participant.userId}`);
  }

  // 更新两支队伍所有球员的出勤率（包括未参赛球员）
  const teamIds = [match.team1Id, match.team2Id];

  for (const teamId of teamIds) {
    // 获取该队伍所有球员（有PlayerStat记录的）
    const teamPlayers = await PlayerStat.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { currentTeamId: teamId },
        attributes: ['id', 'currentTeamId']
      }]
    });

    // 统计该队伍参加的已完成比赛总数
    const teamMatchCount = await Match.count({
      where: {
        status: 'completed',
        [Op.or]: [
          { team1Id: teamId },
          { team2Id: teamId }
        ]
      }
    });

    if (teamMatchCount > 0) {
      // 更新每个队员的出勤率
      for (const playerStat of teamPlayers) {
        const oldRate = playerStat.attendanceRate;
        playerStat.attendanceRate = ((playerStat.matchesPlayed / teamMatchCount) * 100).toFixed(2);
        await playerStat.save();

        logger.info(`Updated attendance for ${playerStat.user.id}: ${oldRate}% → ${playerStat.attendanceRate}% (${playerStat.matchesPlayed}/${teamMatchCount})`);
      }
    }
  }
}

/**
 * 设置节次角色（裁判和守门员）
 * @param {string} matchId 比赛ID
 * @param {number} quarterNumber 节次编号
 * @param {Object} data 角色数据
 */
exports.setQuarterRoles = async (matchId, quarterNumber, data) => {
  const { mainRefereeId, assistantReferee1Id, assistantReferee2Id, team1GoalkeeperId, team2GoalkeeperId } = data;

  // 验证比赛
  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }
  if (!match.quarterSystem) {
    throw new Error('该比赛不是4节制');
  }

  // 验证节次
  const quarter = await MatchQuarter.findOne({
    where: { matchId, quarterNumber }
  });
  if (!quarter) {
    throw new Error(`节次 ${quarterNumber} 不存在`);
  }

  // 验证用户存在（如果提供了ID）
  const { User } = require('../models');
  const userIds = [mainRefereeId, assistantReferee1Id, assistantReferee2Id, team1GoalkeeperId, team2GoalkeeperId].filter(Boolean);

  if (userIds.length > 0) {
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id']
    });

    if (users.length !== userIds.length) {
      throw new Error('部分用户不存在');
    }
  }

  // 更新节次角色
  await quarter.update({
    mainRefereeId: mainRefereeId || null,
    assistantReferee1Id: assistantReferee1Id || null,
    assistantReferee2Id: assistantReferee2Id || null,
    team1GoalkeeperId: team1GoalkeeperId || null,
    team2GoalkeeperId: team2GoalkeeperId || null
  });

  logger.info(`Quarter roles updated: match=${matchId}, quarter=${quarterNumber}`);

  // 重新查询并返回完整数据
  const updatedQuarter = await MatchQuarter.findOne({
    where: { matchId, quarterNumber },
    include: [
      {
        model: User,
        as: 'mainReferee',
        attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
        required: false
      },
      {
        model: User,
        as: 'assistantReferee1',
        attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
        required: false
      },
      {
        model: User,
        as: 'assistantReferee2',
        attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
        required: false
      },
      {
        model: User,
        as: 'team1Goalkeeper',
        attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
        required: false
      },
      {
        model: User,
        as: 'team2Goalkeeper',
        attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber'],
        required: false
      }
    ]
  });

  return {
    quarterNumber: updatedQuarter.quarterNumber,
    mainReferee: updatedQuarter.mainReferee || null,
    assistantReferee1: updatedQuarter.assistantReferee1 || null,
    assistantReferee2: updatedQuarter.assistantReferee2 || null,
    team1Goalkeeper: updatedQuarter.team1Goalkeeper || null,
    team2Goalkeeper: updatedQuarter.team2Goalkeeper || null
  };
};

// 导出 recalculatePlayerStats 供外部调用
exports.recalculatePlayerStats = recalculatePlayerStats;

module.exports = exports;
