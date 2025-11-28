const { Op } = require('sequelize');
const { Team, TeamMember, User, PlayerStat, TeamStat, Match, MatchResult, TeamReshuffle, DraftPick } = require('../models');
const logger = require('../utils/logger');
const sequelize = require('../config/database');

/**
 * 获取队伍列表
 * @param {Object} params 查询参数
 */
exports.getTeamList = async (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    season,
    seasonId,
    status = 'active'
  } = params;

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  const where = {};

  // 统一使用 seasonId
  if (seasonId) {
    where.season = seasonId;
  } else if (season) {
    // 如果提供了 season（兼容旧接口），也当作 seasonId 处理
    where.season = season;
  }

  if (status) {
    where.status = status;
  }

  const { Season } = require('../models');
  const { count, rows } = await Team.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'captain',
        attributes: ['id', 'nickname', 'realName', 'avatar']
      },
      {
        model: TeamStat,
        as: 'stats',
        required: false
      },
      {
        model: Season,
        as: 'seasonInfo',
        attributes: ['id', 'name', 'startDate', 'endDate'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });

  // 获取每个队伍的成员数，并转换 season 为名称
  for (const team of rows) {
    const memberCount = await TeamMember.count({
      where: {
        teamId: team.id,
        isActive: true
      }
    });
    team.setDataValue('memberCount', memberCount);

    // 将 season 字段从 UUID 替换为名称
    if (team.seasonInfo) {
      team.setDataValue('season', team.seasonInfo.name);
    }
  }

  return {
    list: rows,
    total: count,
    page: parseInt(page),
    pageSize: limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * 获取队伍详情
 * @param {string} teamId 队伍ID
 */
exports.getTeamDetail = async (teamId) => {
  const { Season } = require('../models');
  const team = await Team.findByPk(teamId, {
    include: [
      {
        model: User,
        as: 'captain',
        attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position', 'leftFootSkill', 'rightFootSkill']
      },
      {
        model: TeamStat,
        as: 'stats',
        required: false
      },
      {
        model: Season,
        as: 'seasonInfo',
        attributes: ['id', 'name', 'startDate', 'endDate'],
        required: false
      },
      {
        model: TeamMember,
        as: 'members',
        where: { isActive: true },
        required: false,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position', 'leftFootSkill', 'rightFootSkill', 'memberType'],
            include: [
              {
                model: PlayerStat,
                as: 'stats',
                attributes: ['matchesPlayed', 'goals', 'assists', 'winRate'],
                required: false
              }
            ]
          }
        ]
      }
    ]
  });

  // 如果查询不到队伍，返回null（用户未加入队伍是正常情况）
  if (!team) {
    return null;
  }

  // 将 season 字段从 UUID 替换为名称
  if (team.seasonInfo) {
    team.setDataValue('season', team.seasonInfo.name);
  }

  // 处理 stats 中的 season 字段：改为赛季名称，添加 seasonId 字段
  if (team.stats && team.seasonInfo) {
    team.stats.setDataValue('seasonId', team.stats.season); // 保存原 UUID 到 seasonId
    team.stats.setDataValue('season', team.seasonInfo.name); // season 改为名称
  }

  // 对成员进行排序：队长排第一位，其他成员按出场次数倒序排列
  if (team.members && team.members.length > 0) {
    team.members.sort((a, b) => {
      // 队长排第一位
      if (a.role === 'captain' && b.role !== 'captain') return -1;
      if (a.role !== 'captain' && b.role === 'captain') return 1;

      // 其他成员按出场次数倒序排列（多到少）
      const matchesA = a.user?.stats?.matchesPlayed || 0;
      const matchesB = b.user?.stats?.matchesPlayed || 0;
      return matchesB - matchesA;
    });
  }

  return team;
};

/**
 * 创建队伍
 * @param {Object} data 队伍数据
 * @param {string} userId 创建者ID
 */
exports.createTeam = async (data, userId) => {
  const { name, captainId, color, season, logo } = data;

  // 验证队长是否存在
  const captain = await User.findByPk(captainId);
  if (!captain) {
    throw new Error('队长不存在');
  }

  // 创建队伍
  const team = await Team.create({
    name,
    captainId,
    color,
    season,
    logo,
    status: 'active',
    createdBy: userId
  });

  // 将队长添加为队伍成员
  await TeamMember.create({
    teamId: team.id,
    userId: captainId,
    role: 'captain',
    isActive: true
  });

  // 更新队长的当前队伍
  await captain.update({ currentTeamId: team.id });

  // 创建队伍统计记录
  await TeamStat.create({
    teamId: team.id,
    season
  });

  logger.info(`Team created: ${team.id}, name: ${team.name}`);

  return team;
};

/**
 * 同时创建两个队伍
 * @param {Object} data 两个队伍的数据
 * @param {string} userId 创建者ID
 */
exports.createTwoTeams = async (data, userId) => {
  const { season, team1Name, team1CaptainId, team1Color, team2Name, team2CaptainId, team2Color } = data;

  // 验证必填字段
  if (!season || !team1Name || !team1CaptainId || !team2Name || !team2CaptainId) {
    throw new Error('请提供赛季、两个队伍名称和队长');
  }

  // 验证两个队长是否存在
  const captain1 = await User.findByPk(team1CaptainId);
  if (!captain1) {
    throw new Error('队伍1的队长不存在');
  }

  const captain2 = await User.findByPk(team2CaptainId);
  if (!captain2) {
    throw new Error('队伍2的队长不存在');
  }

  // 验证两个队长不能是同一个人
  if (team1CaptainId === team2CaptainId) {
    throw new Error('两个队伍的队长不能是同一个人');
  }

  // 使用事务确保两个队伍同时创建成功或失败
  const transaction = await sequelize.transaction();

  try {
    // 创建队伍1
    const team1 = await Team.create({
      name: team1Name,
      captainId: team1CaptainId,
      color: team1Color || null,
      season,
      status: 'active',
      createdBy: userId
    }, { transaction });

    // 将队长1添加为队伍成员
    await TeamMember.create({
      teamId: team1.id,
      userId: team1CaptainId,
      role: 'captain',
      isActive: true
    }, { transaction });

    // 更新队长1的当前队伍
    await captain1.update({ currentTeamId: team1.id }, { transaction });

    // 创建队伍1统计记录
    await TeamStat.create({
      teamId: team1.id,
      season
    }, { transaction });

    // 创建队伍2
    const team2 = await Team.create({
      name: team2Name,
      captainId: team2CaptainId,
      color: team2Color || null,
      season,
      status: 'active',
      createdBy: userId
    }, { transaction });

    // 将队长2添加为队伍成员
    await TeamMember.create({
      teamId: team2.id,
      userId: team2CaptainId,
      role: 'captain',
      isActive: true
    }, { transaction });

    // 更新队长2的当前队伍
    await captain2.update({ currentTeamId: team2.id }, { transaction });

    // 创建队伍2统计记录
    await TeamStat.create({
      teamId: team2.id,
      season
    }, { transaction });

    // 提交事务
    await transaction.commit();

    logger.info(`Two teams created: ${team1.id} (${team1.name}), ${team2.id} (${team2.name})`);

    return {
      team1: team1.toJSON(),
      team2: team2.toJSON()
    };
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error(`Failed to create two teams: ${error.message}`);
    throw error;
  }
};

/**
 * 更新队伍信息
 * @param {string} teamId 队伍ID
 * @param {Object} data 更新数据
 * @param {string} userId 操作者ID
 */
exports.updateTeam = async (teamId, data, userId) => {
  const team = await Team.findByPk(teamId);

  if (!team) {
    throw new Error('队伍不存在');
  }

  // 验证权限（只有队长和管理员可以编辑）
  const user = await User.findByPk(userId);
  if (team.captainId !== userId && user.role !== 'super_admin') {
    throw new Error('没有权限编辑队伍信息');
  }

  // 只允许更新特定字段
  const allowedFields = ['name', 'logo', 'color', 'captainId'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  // 如果更新了队长，需要同步更新 team_members 表和 users 表中的角色
  if (data.captainId && data.captainId !== team.captainId) {
    const { TeamMember } = require('../models');

    // 验证新队长是否在该队伍中
    const newCaptainMembership = await TeamMember.findOne({
      where: { teamId, userId: data.captainId, isActive: true }
    });

    if (!newCaptainMembership) {
      throw new Error('新队长必须是队伍成员');
    }

    // 将原队长降为普通成员
    if (team.captainId) {
      // 更新 team_members 表
      await TeamMember.update(
        { role: 'member' },
        { where: { teamId, userId: team.captainId } }
      );

      // 更新 users 表（只有当原队长不是 super_admin 时才降级）
      const oldCaptain = await User.findByPk(team.captainId);
      if (oldCaptain && oldCaptain.role === 'captain') {
        await oldCaptain.update({ role: 'member' });
      }
    }

    // 将新队长设置为队长角色
    // 更新 team_members 表
    await TeamMember.update(
      { role: 'captain' },
      { where: { teamId, userId: data.captainId } }
    );

    // 更新 users 表
    const newCaptain = await User.findByPk(data.captainId);
    if (newCaptain) {
      const updates = {};

      // 更新角色（只有当新队长不是 super_admin 时才升级）
      if (newCaptain.role !== 'super_admin') {
        updates.role = 'captain';
      }

      // 更新当前队伍ID（确保新队长的 current_team_id 指向这个队伍）
      if (newCaptain.currentTeamId !== teamId) {
        updates.currentTeamId = teamId;
      }

      if (Object.keys(updates).length > 0) {
        await newCaptain.update(updates);
      }
    }

    logger.info(`Team captain changed: ${team.captainId} -> ${data.captainId}`);
  }

  await team.update(updateData);

  logger.info(`Team updated: ${teamId}`);

  return team;
};

/**
 * 获取队伍成员
 * @param {string} teamId 队伍ID
 */
exports.getTeamMembers = async (teamId) => {
  const members = await TeamMember.findAll({
    where: {
      teamId,
      isActive: true
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position'],
        include: [
          {
            model: PlayerStat,
            as: 'stats',
            attributes: ['matchesPlayed', 'goals', 'assists', 'winRate'],
            required: false
          }
        ]
      }
    ],
    order: [['role', 'DESC'], ['joinedAt', 'ASC']]
  });

  return members;
};

/**
 * 获取队伍对战记录
 * @param {string} team1Id 队伍1 ID
 * @param {string} team2Id 队伍2 ID（可选，如不提供则获取team1的所有比赛）
 */
exports.getTeamVsRecord = async (team1Id, team2Id = null) => {
  const where = {
    status: 'completed',
    [Op.or]: [
      { team1Id: team1Id },
      { team2Id: team1Id }
    ]
  };

  // 如果指定了对手队伍，添加对手条件
  if (team2Id) {
    where[Op.and] = [
      {
        [Op.or]: [
          { team1Id: team1Id, team2Id: team2Id },
          { team1Id: team2Id, team2Id: team1Id }
        ]
      }
    ];
  }

  const matches = await Match.findAll({
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
        required: true
      }
    ],
    order: [['matchDate', 'DESC']],
    limit: 20
  });

  // 统计对战记录
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  matches.forEach(match => {
    const isTeam1 = match.team1Id === team1Id;
    const teamScore = isTeam1 ? match.result.team1Score : match.result.team2Score;
    const opponentScore = isTeam1 ? match.result.team2Score : match.result.team1Score;

    goalsFor += teamScore;
    goalsAgainst += opponentScore;

    if (teamScore > opponentScore) {
      wins++;
    } else if (teamScore < opponentScore) {
      losses++;
    } else {
      draws++;
    }
  });

  return {
    matches,
    summary: {
      totalMatches: matches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      winRate: matches.length > 0 ? ((wins / matches.length) * 100).toFixed(2) : 0
    }
  };
};

/**
 * 开始队伍重组
 * @param {Object} data 重组数据
 * @param {string} userId 发起人ID
 */
exports.startReshuffle = async (data, userId) => {
  const { seasonId, captain1Id, captain2Id, team1Id, team2Id } = data;

  // 验证发起人是否是管理员
  const initiator = await User.findByPk(userId);
  if (!initiator || initiator.role !== 'super_admin') {
    throw new Error('只有超级管理员可以发起队伍重组');
  }

  if (!seasonId) {
    throw new Error('请提供赛季ID');
  }

  // 验证赛季是否存在
  const { Season } = require('../models');
  const season = await Season.findByPk(seasonId);
  if (!season) {
    throw new Error('赛季不存在');
  }

  // 验证两个队长
  const captain1 = await User.findByPk(captain1Id);
  const captain2 = await User.findByPk(captain2Id);
  if (!captain1 || !captain2) {
    throw new Error('队长不存在');
  }

  // 验证两个队伍
  const team1 = await Team.findByPk(team1Id);
  const team2 = await Team.findByPk(team2Id);
  if (!team1 || !team2) {
    throw new Error('队伍不存在');
  }

  // 检查是否有正在进行的重组
  const ongoingReshuffle = await TeamReshuffle.findOne({
    where: {
      status: 'draft_in_progress'
    }
  });

  if (ongoingReshuffle) {
    throw new Error('当前有正在进行的重组，请先完成或取消');
  }

  // 创建重组记录
  const reshuffle = await TeamReshuffle.create({
    season: seasonId,
    initiatorId: userId,
    captain1Id,
    captain2Id,
    team1Id,
    team2Id,
    status: 'draft_in_progress',
    startedAt: new Date()
  });

  logger.info(`Reshuffle started: ${reshuffle.id}, season: ${seasonId}`);

  return reshuffle;
};

/**
 * 选择球员
 * @param {Object} data 选人数据
 * @param {string} userId 队长ID
 */
exports.pickPlayer = async (data, userId) => {
  const { reshuffleId, pickedUserId } = data;

  // 获取重组记录
  const reshuffle = await TeamReshuffle.findByPk(reshuffleId, {
    include: [
      { model: User, as: 'captain1', attributes: ['id', 'nickname'] },
      { model: User, as: 'captain2', attributes: ['id', 'nickname'] },
      { model: Team, as: 'team1', attributes: ['id', 'name'] },
      { model: Team, as: 'team2', attributes: ['id', 'name'] },
      { model: DraftPick, as: 'picks', order: [['pickOrder', 'ASC']] }
    ]
  });

  if (!reshuffle) {
    throw new Error('重组记录不存在');
  }

  if (reshuffle.status !== 'draft_in_progress') {
    throw new Error('重组已结束，无法继续选人');
  }

  // 验证是否是队长
  if (userId !== reshuffle.captain1Id && userId !== reshuffle.captain2Id) {
    throw new Error('只有队长可以选人');
  }

  // 计算当前选人顺序（蛇形选择：1-2-2-2-2...）
  const currentPickOrder = reshuffle.picks.length + 1;
  const currentRound = Math.ceil(currentPickOrder / 2);

  // 确定当前轮到谁选
  let expectedCaptainId;
  if (currentPickOrder === 1) {
    // 第1顺位，队长1先选
    expectedCaptainId = reshuffle.captain1Id;
  } else if (currentPickOrder % 4 === 2 || currentPickOrder % 4 === 3) {
    // 第2,3,6,7,10,11... 顺位，队长2选
    expectedCaptainId = reshuffle.captain2Id;
  } else {
    // 第4,5,8,9,12,13... 顺位，队长1选
    expectedCaptainId = reshuffle.captain1Id;
  }

  if (userId !== expectedCaptainId) {
    throw new Error('当前不是你的选人回合');
  }

  // 验证被选球员
  const pickedUser = await User.findByPk(pickedUserId);
  if (!pickedUser) {
    throw new Error('球员不存在');
  }

  // 验证球员是否是正式队员
  if (pickedUser.memberType !== 'regular') {
    throw new Error('只能选择正式队员');
  }

  // 验证球员是否已被选
  const alreadyPicked = reshuffle.picks.some(pick => pick.pickedUserId === pickedUserId);
  if (alreadyPicked) {
    throw new Error('该球员已被选择');
  }

  // 确定球员加入的队伍
  const teamId = userId === reshuffle.captain1Id ? reshuffle.team1Id : reshuffle.team2Id;

  // 创建选人记录
  const pick = await DraftPick.create({
    reshuffleId,
    round: currentRound,
    pickOrder: currentPickOrder,
    captainId: userId,
    pickedUserId,
    teamId,
    pickedAt: new Date()
  });

  logger.info(`Player picked: ${pickedUserId} by captain ${userId}, order: ${currentPickOrder}`);

  // 返回选人记录和当前状态
  return {
    pick: await DraftPick.findByPk(pick.id, {
      include: [
        { model: User, as: 'pickedUser', attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position'] },
        { model: User, as: 'captain', attributes: ['id', 'nickname'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'color'] }
      ]
    }),
    nextCaptain: currentPickOrder % 4 === 1 || currentPickOrder % 4 === 0 ? reshuffle.captain2 : reshuffle.captain1
  };
};

/**
 * 完成重组
 * @param {string} reshuffleId 重组ID
 * @param {string} userId 操作者ID
 */
exports.completeReshuffle = async (reshuffleId, userId) => {
  const transaction = await sequelize.transaction();

  try {
    // 获取重组记录
    const reshuffle = await TeamReshuffle.findByPk(reshuffleId, {
      include: [
        { model: DraftPick, as: 'picks' }
      ],
      transaction
    });

    if (!reshuffle) {
      throw new Error('重组记录不存在');
    }

    // 验证权限
    const user = await User.findByPk(userId, { transaction });
    if (user.role !== 'super_admin' && userId !== reshuffle.initiatorId) {
      throw new Error('只有管理员或发起人可以完成重组');
    }

    if (reshuffle.status !== 'draft_in_progress') {
      throw new Error('重组已结束');
    }

    // 更新重组状态
    await reshuffle.update({
      status: 'completed',
      completedAt: new Date()
    }, { transaction });

    // 将选中的球员加入对应队伍（更新 team_members 表）
    for (const pick of reshuffle.picks) {
      // 先将球员从旧队伍移除（设置为不活跃）
      await TeamMember.update(
        { isActive: false },
        {
          where: {
            userId: pick.pickedUserId,
            isActive: true
          },
          transaction
        }
      );

      // 添加到新队伍
      await TeamMember.create({
        teamId: pick.teamId,
        userId: pick.pickedUserId,
        role: 'member',
        isActive: true,
        joinedAt: new Date()
      }, { transaction });

      // 更新用户的当前队伍
      await User.update(
        { currentTeamId: pick.teamId },
        {
          where: { id: pick.pickedUserId },
          transaction
        }
      );
    }

    await transaction.commit();

    logger.info(`Reshuffle completed: ${reshuffleId}`);

    return reshuffle;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * 获取重组状态（用于前端轮询）
 * @param {string} reshuffleId 重组ID
 */
exports.getReshuffleStatus = async (reshuffleId) => {
  const reshuffle = await TeamReshuffle.findByPk(reshuffleId, {
    include: [
      { model: User, as: 'captain1', attributes: ['id', 'nickname', 'avatar'] },
      { model: User, as: 'captain2', attributes: ['id', 'nickname', 'avatar'] },
      { model: Team, as: 'team1', attributes: ['id', 'name', 'color', 'logo'] },
      { model: Team, as: 'team2', attributes: ['id', 'name', 'color', 'logo'] },
      {
        model: DraftPick,
        as: 'picks',
        include: [
          { model: User, as: 'pickedUser', attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position'] },
          { model: Team, as: 'team', attributes: ['id', 'name'] }
        ],
        order: [['pickOrder', 'ASC']]
      }
    ]
  });

  if (!reshuffle) {
    throw new Error('重组记录不存在');
  }

  // 计算当前轮到谁选
  const currentPickOrder = reshuffle.picks.length + 1;
  let currentCaptain = null;

  if (reshuffle.status === 'draft_in_progress') {
    if (currentPickOrder === 1) {
      currentCaptain = reshuffle.captain1;
    } else if (currentPickOrder % 4 === 2 || currentPickOrder % 4 === 3) {
      currentCaptain = reshuffle.captain2;
    } else {
      currentCaptain = reshuffle.captain1;
    }
  }

  return {
    reshuffle,
    currentPickOrder,
    currentCaptain,
    team1PickedCount: reshuffle.picks.filter(p => p.teamId === reshuffle.team1Id).length,
    team2PickedCount: reshuffle.picks.filter(p => p.teamId === reshuffle.team2Id).length
  };
};

/**
 * 获取可选球员列表
 * @param {string} reshuffleId 重组ID
 */
exports.getAvailablePlayers = async (reshuffleId) => {
  const reshuffle = await TeamReshuffle.findByPk(reshuffleId, {
    include: [
      { model: DraftPick, as: 'picks', attributes: ['pickedUserId'] }
    ]
  });

  if (!reshuffle) {
    throw new Error('重组记录不存在');
  }

  // 获取已选球员ID列表
  const pickedUserIds = reshuffle.picks.map(pick => pick.pickedUserId);

  // 获取所有正式队员，排除已选的
  const availablePlayers = await User.findAll({
    where: {
      memberType: 'regular',
      status: 'active',
      id: {
        [Op.notIn]: pickedUserIds.length > 0 ? pickedUserIds : ['00000000-0000-0000-0000-000000000000']
      }
    },
    include: [
      {
        model: PlayerStat,
        as: 'stats',
        attributes: ['matchesPlayed', 'goals', 'assists', 'saves', 'winRate'],
        required: false
      }
    ],
    attributes: ['id', 'nickname', 'realName', 'avatar', 'jerseyNumber', 'position'],
    order: [['nickname', 'ASC']]
  });

  return availablePlayers;
};

/**
 * 获取球员的Draft历史
 * @param {string} userId 球员ID
 */
exports.getPlayerDraftHistory = async (userId) => {
  const draftHistory = await DraftPick.findAll({
    where: { pickedUserId: userId },
    include: [
      {
        model: TeamReshuffle,
        as: 'reshuffle',
        attributes: ['id', 'season', 'startedAt', 'completedAt'],
        where: { status: 'completed' }
      },
      { model: User, as: 'captain', attributes: ['id', 'nickname', 'avatar'] },
      { model: Team, as: 'team', attributes: ['id', 'name', 'color', 'logo'] }
    ],
    order: [['pickedAt', 'DESC']]
  });

  return draftHistory;
};

/**
 * 获取重组历史记录
 * @param {Object} params 查询参数
 */
exports.getReshuffleHistory = async (params = {}) => {
  const { page = 1, pageSize = 20, season } = params;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  const where = { status: 'completed' };
  if (season) {
    where.season = season;
  }

  const { count, rows } = await TeamReshuffle.findAndCountAll({
    where,
    include: [
      { model: User, as: 'captain1', attributes: ['id', 'nickname', 'avatar'] },
      { model: User, as: 'captain2', attributes: ['id', 'nickname', 'avatar'] },
      { model: Team, as: 'team1', attributes: ['id', 'name', 'color', 'logo'] },
      { model: Team, as: 'team2', attributes: ['id', 'name', 'color', 'logo'] },
      { model: DraftPick, as: 'picks', attributes: ['id'] }
    ],
    offset,
    limit,
    order: [['startedAt', 'DESC']]
  });

  return {
    list: rows,
    total: count,
    page: parseInt(page),
    pageSize: limit,
    totalPages: Math.ceil(count / limit)
  };
};
