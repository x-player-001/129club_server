const { Op } = require('sequelize');
const { Match, Registration, Team, User, Lineup, MatchEvent, MatchResult, MatchParticipant } = require('../models');
const logger = require('../utils/logger');
const { autoUpdateMatchStatus } = require('../utils/matchStatusUpdater');

/**
 * 获取比赛列表
 * @param {Object} params 查询参数
 * @param {string} params.teamId - 队伍ID
 * @param {string} params.matchResult - 比赛结果筛选(win=胜, draw=平, loss=负), 需要配合teamId使用
 * @param {string} params.status - 比赛状态
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
exports.getMatchList = async (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    status,
    teamId,
    matchResult,
    startDate,
    endDate
  } = params;

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (teamId) {
    where[Op.or] = [
      { team1Id: teamId },
      { team2Id: teamId }
    ];
  }

  if (startDate || endDate) {
    where.matchDate = {};
    if (startDate) {
      where.matchDate[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.matchDate[Op.lte] = new Date(endDate);
    }
  }

  const { count, rows } = await Match.findAndCountAll({
    where,
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
        model: MatchResult,
        as: 'result',
        required: false
      }
    ],
    offset,
    limit,
    order: [['matchDate', 'DESC']]
  });

  // 如果需要按matchResult筛选,需要在内存中过滤
  let filteredRows = rows;
  if (teamId && matchResult && ['win', 'draw', 'loss'].includes(matchResult)) {
    filteredRows = rows.filter(match => {
      // 只筛选已完成的比赛
      if (match.status !== 'completed' || !match.result) {
        return false;
      }

      const winnerTeamId = match.result.winnerTeamId;

      if (matchResult === 'win') {
        // 查找该队赢的比赛
        return winnerTeamId === teamId;
      } else if (matchResult === 'draw') {
        // 查找平局的比赛
        return winnerTeamId === null;
      } else if (matchResult === 'loss') {
        // 查找该队输的比赛
        return winnerTeamId !== null && winnerTeamId !== teamId;
      }

      return false;
    });
  }

  // 获取每场比赛的报名人数
  for (const match of filteredRows) {
    const team1Count = await Registration.count({
      where: { matchId: match.id, teamId: match.team1Id, status: { [Op.in]: ['registered', 'confirmed'] } }
    });
    const team2Count = await Registration.count({
      where: { matchId: match.id, teamId: match.team2Id, status: { [Op.in]: ['registered', 'confirmed'] } }
    });
    match.setDataValue('team1RegisterCount', team1Count);
    match.setDataValue('team2RegisterCount', team2Count);
  }

  return {
    list: filteredRows,
    total: filteredRows.length, // 注意: 这里返回的是过滤后的总数
    page: parseInt(page),
    pageSize: limit,
    totalPages: Math.ceil(filteredRows.length / limit)
  };
};

/**
 * 获取比赛详情
 * @param {string} matchId 比赛ID
 */
exports.getMatchDetail = async (matchId) => {
  // 自动更新比赛状态（根据当前时间）
  await autoUpdateMatchStatus(matchId);

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
        model: User,
        as: 'creator',
        attributes: ['id', 'nickname', 'realName']
      },
      {
        model: MatchResult,
        as: 'result',
        required: false
      }
    ]
  });

  if (!match) {
    throw new Error('比赛不存在');
  }

  return match;
};

/**
 * 创建比赛
 * @param {Object} data 比赛数据
 * @param {string} userId 创建者ID
 */
exports.createMatch = async (data, userId) => {
  const { title, team1Id, team2Id, matchDate, location, description, registrationDeadline, maxPlayersPerTeam, quarterSystem, seasonId } = data;

  // 验证队伍是否存在
  const team1 = await Team.findByPk(team1Id);
  const team2 = await Team.findByPk(team2Id);

  if (!team1 || !team2) {
    throw new Error('队伍不存在');
  }

  if (team1Id === team2Id) {
    throw new Error('不能选择相同的队伍');
  }

  // 如果提供了seasonId，验证赛季是否存在，并检查比赛数是否达到上限
  if (seasonId) {
    const Season = require('../models/Season');
    const season = await Season.findByPk(seasonId);

    if (!season) {
      throw new Error('赛季不存在');
    }

    // 检查赛季状态
    if (season.status === 'completed' || season.status === 'archived') {
      throw new Error(`赛季状态为${season.status}，无法添加比赛`);
    }

    // 检查赛季比赛数是否达到上限（可选验证）
    if (season.maxMatches) {
      const matchCount = await Match.count({ where: { seasonId } });
      if (matchCount >= season.maxMatches) {
        throw new Error(`赛季比赛数已达上限（${season.maxMatches}场）`);
      }
    }
  }

  // 创建比赛
  const match = await Match.create({
    title,
    team1Id,
    team2Id,
    matchDate: new Date(matchDate),
    location,
    description: description || null,
    seasonId: seasonId || null,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
    maxPlayersPerTeam: maxPlayersPerTeam || 8, // 默认8人制，可选5/8/11
    quarterSystem: quarterSystem !== undefined ? quarterSystem : true, // 默认为4节制
    finalTeam1Score: 0,
    finalTeam2Score: 0,
    status: 'registration',
    createdBy: userId
  });

  logger.info(`Match created: ${match.id}, ${team1.name} vs ${team2.name} (quarterSystem: ${quarterSystem !== undefined ? quarterSystem : true}, seasonId: ${seasonId || 'none'})`);

  return match;
};

/**
 * 更新比赛信息
 * @param {string} matchId 比赛ID
 * @param {Object} data 更新数据
 */
exports.updateMatch = async (matchId, data) => {
  const match = await Match.findByPk(matchId);

  if (!match) {
    throw new Error('比赛不存在');
  }

  if (match.status === 'completed') {
    throw new Error('已完成的比赛不能修改');
  }

  // 只允许更新特定字段
  const allowedFields = ['title', 'matchDate', 'location', 'description', 'registrationDeadline', 'maxPlayersPerTeam', 'status'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      if (field === 'matchDate' || field === 'registrationDeadline') {
        updateData[field] = new Date(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  });

  await match.update(updateData);

  logger.info(`Match updated: ${matchId}`);

  return match;
};

/**
 * 报名比赛
 * @param {string} matchId 比赛ID
 * @param {string} userId 用户ID
 * @param {Object} data 报名数据
 */
exports.registerMatch = async (matchId, userId, data = {}) => {
  const match = await Match.findByPk(matchId, {
    include: [
      { model: Team, as: 'team1' },
      { model: Team, as: 'team2' }
    ]
  });

  if (!match) {
    throw new Error('比赛不存在');
  }

  if (match.status !== 'registration') {
    throw new Error('当前比赛不允许报名');
  }

  // 检查报名截止时间
  if (match.registrationDeadline && new Date() > match.registrationDeadline) {
    throw new Error('报名已截止');
  }

  // 获取用户当前队伍
  const user = await User.findByPk(userId);
  if (!user.currentTeamId) {
    throw new Error('您还未加入任何队伍');
  }

  // 验证用户是否属于参赛队伍
  if (user.currentTeamId !== match.team1Id && user.currentTeamId !== match.team2Id) {
    throw new Error('您不属于参赛队伍');
  }

  // 检查是否已报名
  const existingReg = await Registration.findOne({
    where: { matchId, userId }
  });

  if (existingReg) {
    if (existingReg.status === 'cancelled') {
      // 重新报名
      await existingReg.update({ status: 'registered', notes: data.notes || null });
      return existingReg;
    }
    throw new Error('您已报名此比赛');
  }

  // 注释掉报名人数限制，允许超过比赛类型人数报名
  // 真实场景：maxPlayersPerTeam 代表比赛类型（5人制/8人制/11人制），不限制报名人数
  // const teamRegCount = await Registration.count({
  //   where: {
  //     matchId,
  //     teamId: user.currentTeamId,
  //     status: { [Op.in]: ['registered', 'confirmed'] }
  //   }
  // });

  // if (teamRegCount >= match.maxPlayersPerTeam) {
  //   throw new Error(`本队报名人数已满（${match.maxPlayersPerTeam}人）`);
  // }

  // 创建报名记录
  const registration = await Registration.create({
    matchId,
    userId,
    teamId: user.currentTeamId,
    status: 'registered',
    notes: data.notes || null
  });

  logger.info(`User registered for match: ${userId} -> ${matchId}`);

  return registration;
};

/**
 * 取消报名
 * @param {string} matchId 比赛ID
 * @param {string} userId 用户ID
 */
exports.cancelRegister = async (matchId, userId) => {
  const registration = await Registration.findOne({
    where: { matchId, userId }
  });

  if (!registration) {
    throw new Error('未找到报名记录');
  }

  if (registration.status === 'cancelled') {
    throw new Error('报名已取消');
  }

  const match = await Match.findByPk(matchId);
  if (match.status !== 'registration') {
    throw new Error('当前比赛状态不允许取消报名');
  }

  await registration.update({ status: 'cancelled' });

  logger.info(`User cancelled registration: ${userId} -> ${matchId}`);

  return registration;
};

/**
 * 获取比赛报名列表
 * @param {string} matchId 比赛ID
 */
exports.getRegistrationList = async (matchId) => {
  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  const registrations = await Registration.findAll({
    where: {
      matchId,
      status: { [Op.in]: ['registered', 'confirmed'] }
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position']
      },
      {
        model: Team,
        as: 'team',
        attributes: ['id', 'name', 'logo', 'color']
      }
    ],
    order: [['registeredAt', 'ASC']]
  });

  // 按队伍分组
  const team1Regs = registrations.filter(r => r.teamId === match.team1Id);
  const team2Regs = registrations.filter(r => r.teamId === match.team2Id);

  return {
    team1: team1Regs,
    team2: team2Regs,
    team1Count: team1Regs.length,
    team2Count: team2Regs.length
  };
};

/**
 * 设置比赛阵容
 * @param {string} matchId 比赛ID
 * @param {Object} data 阵容数据 { teamId, lineups: [{userId, position, isStarting}] }
 * @param {string} userId 操作者ID
 */
exports.setLineup = async (matchId, data, userId) => {
  const { teamId, lineups } = data;

  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  if (match.status === 'completed' || match.status === 'cancelled') {
    throw new Error('当前比赛状态不允许设置阵容');
  }

  // 验证队伍
  if (teamId !== match.team1Id && teamId !== match.team2Id) {
    throw new Error('队伍不属于此比赛');
  }

  // 验证权限: 必须是队长
  const team = await Team.findByPk(teamId);
  if (team.captainId !== userId) {
    throw new Error('只有队长可以设置阵容');
  }

  // 验证所有球员都已报名
  for (const lineup of lineups) {
    const registration = await Registration.findOne({
      where: {
        matchId,
        userId: lineup.userId,
        teamId,
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });

    if (!registration) {
      throw new Error(`球员 ${lineup.userId} 未报名或报名状态不正确`);
    }
  }

  // 删除该队伍之前的阵容
  await Lineup.destroy({
    where: { matchId, teamId }
  });

  // 创建新阵容
  const createdLineups = await Promise.all(
    lineups.map(lineup =>
      Lineup.create({
        matchId,
        userId: lineup.userId,
        teamId,
        position: lineup.position || null,
        isStarting: lineup.isStarting || false,
        playTime: lineup.playTime || 0
      })
    )
  );

  logger.info(`Lineup set for match ${matchId}, team ${teamId}`);

  return createdLineups;
};

/**
 * 记录比赛事件
 * @param {string} matchId 比赛ID
 * @param {Object} data 事件数据 { type, userId, teamId, minute, description, assistUserId }
 */
exports.recordEvent = async (matchId, data) => {
  const { type, userId, teamId, minute, description, assistUserId } = data;

  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  if (match.status !== 'in_progress' && match.status !== 'completed') {
    throw new Error('只有进行中或已完成的比赛可以记录事件');
  }

  // 验证事件类型
  const validTypes = ['goal', 'assist', 'yellow_card', 'red_card', 'substitution'];
  if (!validTypes.includes(type)) {
    throw new Error('无效的事件类型');
  }

  // 创建事件记录
  const event = await MatchEvent.create({
    matchId,
    eventType: type,
    userId,
    teamId,
    minute: minute || null,
    description: description || null
  });

  // 如果是进球事件且有助攻,记录助攻事件
  if (type === 'goal' && assistUserId) {
    await MatchEvent.create({
      matchId,
      eventType: 'assist',
      userId: assistUserId,
      teamId,
      minute,
      description: `助攻 ${userId} 的进球`
    });
  }

  logger.info(`Event recorded: ${type} by ${userId} in match ${matchId}`);

  return event;
};

/**
 * 提交比赛结果
 * @param {string} matchId 比赛ID
 * @param {Object} data 结果数据 { team1Score, team2Score, mvpUserId, summary, photos }
 * @param {string} userId 提交者ID
 */
exports.submitResult = async (matchId, data, userId) => {
  const { team1Score, team2Score, mvpUserId, summary, photos } = data;

  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  if (match.status === 'completed') {
    throw new Error('比赛结果已提交');
  }

  // 验证比分
  if (team1Score === undefined || team2Score === undefined) {
    throw new Error('请填写比分');
  }

  if (team1Score < 0 || team2Score < 0) {
    throw new Error('比分不能为负数');
  }

  // 确定获胜队伍
  let winnerTeamId = null;
  if (team1Score > team2Score) {
    winnerTeamId = match.team1Id;
  } else if (team2Score > team1Score) {
    winnerTeamId = match.team2Id;
  }

  // 检查是否已有结果记录
  let result = await MatchResult.findOne({
    where: { matchId }
  });

  if (result) {
    // 更新现有记录
    await result.update({
      team1Score,
      team2Score,
      winnerTeamId,
      mvpUserId: mvpUserId || null,
      summary: summary || null,
      photos: photos || null,
      submittedBy: userId,
      submittedAt: new Date()
    });
  } else {
    // 创建新记录
    result = await MatchResult.create({
      matchId,
      team1Score,
      team2Score,
      winnerTeamId,
      mvpUserId: mvpUserId || null,
      summary: summary || null,
      photos: photos || null,
      submittedBy: userId,
      submittedAt: new Date()
    });
  }

  // 更新比赛状态为已完成
  await match.update({ status: 'completed' });

  logger.info(`Match result submitted: ${matchId}, ${team1Score}:${team2Score}`);

  // TODO: 触发统计计算(在统计计算脚本中实现)

  return result;
};

/**
 * 取消比赛
 * @param {string} matchId 比赛ID
 */
exports.cancelMatch = async (matchId) => {
  const match = await Match.findByPk(matchId);

  if (!match) {
    throw new Error('比赛不存在');
  }

  if (match.status === 'completed') {
    throw new Error('已完成的比赛不能取消');
  }

  await match.update({ status: 'cancelled' });

  logger.info(`Match cancelled: ${matchId}`);

  return match;
};

/**
 * 获取比赛参赛球员列表（实际到场球员）
 * @param {string} matchId 比赛ID
 */
exports.getMatchParticipants = async (matchId) => {
  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  const participants = await MatchParticipant.findAll({
    where: { matchId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position']
      },
      {
        model: Team,
        as: 'team',
        attributes: ['id', 'name', 'logo', 'color']
      }
    ],
    order: [['teamId', 'ASC'], ['createdAt', 'ASC']]
  });

  // 按队伍分组
  const team1Participants = participants.filter(p => p.teamId === match.team1Id);
  const team2Participants = participants.filter(p => p.teamId === match.team2Id);

  return {
    team1: team1Participants,
    team2: team2Participants,
    team1Count: team1Participants.length,
    team2Count: team2Participants.length,
    totalCount: participants.length
  };
};

/**
 * 设置比赛参赛球员（实际到场球员）
 * @param {string} matchId 比赛ID
 * @param {Object} data 参赛球员数据
 */
exports.setMatchParticipants = async (matchId, data) => {
  const { team1, team2 } = data;

  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  // 验证传入的球员是否已报名
  if (team1 && team1.length > 0) {
    const team1Registrations = await Registration.count({
      where: {
        matchId,
        teamId: match.team1Id,
        userId: { [Op.in]: team1 },
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });
    if (team1Registrations !== team1.length) {
      throw new Error('队伍1存在未报名的球员');
    }
  }

  if (team2 && team2.length > 0) {
    const team2Registrations = await Registration.count({
      where: {
        matchId,
        teamId: match.team2Id,
        userId: { [Op.in]: team2 },
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });
    if (team2Registrations !== team2.length) {
      throw new Error('队伍2存在未报名的球员');
    }
  }

  // 清空原有参赛球员
  await MatchParticipant.destroy({
    where: { matchId }
  });

  // 添加新的参赛球员
  const participants = [];

  if (team1 && team1.length > 0) {
    for (const userId of team1) {
      const participant = await MatchParticipant.create({
        matchId,
        teamId: match.team1Id,
        userId,
        isPresent: true
      });
      participants.push(participant);
    }
  }

  if (team2 && team2.length > 0) {
    for (const userId of team2) {
      const participant = await MatchParticipant.create({
        matchId,
        teamId: match.team2Id,
        userId,
        isPresent: true
      });
      participants.push(participant);
    }
  }

  logger.info(`Match participants set: ${matchId}, team1: ${team1?.length || 0}, team2: ${team2?.length || 0}`);

  return {
    team1Count: team1?.length || 0,
    team2Count: team2?.length || 0,
    totalCount: participants.length,
    participants
  };
};


/**
 * 设置比赛参赛球员（实际到场球员）
 * @param {string} matchId 比赛ID
 * @param {Object} data 参赛球员数据
 */
exports.setMatchParticipants = async (matchId, data) => {
  const { team1, team2 } = data;

  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  // 验证传入的球员是否已报名
  if (team1 && team1.length > 0) {
    const team1Registrations = await Registration.count({
      where: {
        matchId,
        teamId: match.team1Id,
        userId: { [Op.in]: team1 },
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });
    if (team1Registrations !== team1.length) {
      throw new Error('队伍1存在未报名的球员');
    }
  }

  if (team2 && team2.length > 0) {
    const team2Registrations = await Registration.count({
      where: {
        matchId,
        teamId: match.team2Id,
        userId: { [Op.in]: team2 },
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });
    if (team2Registrations !== team2.length) {
      throw new Error('队伍2存在未报名的球员');
    }
  }

  // 清空原有参赛球员
  await MatchParticipant.destroy({
    where: { matchId }
  });

  // 添加新的参赛球员
  const participants = [];

  if (team1 && team1.length > 0) {
    for (const userId of team1) {
      const participant = await MatchParticipant.create({
        matchId,
        teamId: match.team1Id,
        userId,
        isPresent: true
      });
      participants.push(participant);
    }
  }

  if (team2 && team2.length > 0) {
    for (const userId of team2) {
      const participant = await MatchParticipant.create({
        matchId,
        teamId: match.team2Id,
        userId,
        isPresent: true
      });
      participants.push(participant);
    }
  }

  logger.info();

  return {
    team1Count: team1 ? team1.length : 0,
    team2Count: team2 ? team2.length : 0,
    totalCount: participants.length,
    participants
  };
};
