const { Match, MatchResult, MatchParticipant, Season, Team, User, PlayerStat } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.getOverview = async (userId, filterType = 'season') => {
  try {
    const dateFilter = await getDateFilter(filterType);

    const matches = await Match.findAll({
      where: {
        status: 'completed',
        ...dateFilter
      },
      include: [
        {
          model: MatchResult,
          as: 'result',
          required: false
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
          model: Team,
          as: 'team1',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Team,
          as: 'team2',
          attributes: ['id', 'name', 'logo']
        }
      ],
      order: [['matchDate', 'DESC']]
    });

    const summary = calculateSummary(matches);
    const myStats = await calculateMyStats(matches, userId, dateFilter);
    const myRanking = await calculateMyRanking(matches, userId);
    const teamStats = await calculateTeamStats(matches, userId);
    const recentMatches = await formatRecentMatches(matches.slice(0, 5), userId);

    return {
      summary,
      myStats,
      myRanking,
      teamStats,
      recentMatches
    };
  } catch (error) {
    logger.error(`Get overview failed: ${error.message}`);
    throw error;
  }
};

async function getDateFilter(filterType) {
  const now = new Date();

  switch (filterType) {
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return {
        matchDate: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      };
    }

    case 'season': {
      const currentSeason = await Season.findOne({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']]
      });

      if (currentSeason && currentSeason.startDate) {
        const endDate = currentSeason.endDate || now;
        return {
          matchDate: {
            [Op.between]: [currentSeason.startDate, endDate]
          }
        };
      }

      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return {
        matchDate: {
          [Op.gte]: thirtyDaysAgo
        }
      };
    }

    case 'all':
    default:
      return {};
  }
}

function calculateSummary(matches) {
  let totalGoals = 0;
  let totalAssists = 0;

  matches.forEach(match => {
    if (match.result) {
      if (match.result.team1Score) totalGoals += match.result.team1Score;
      if (match.result.team2Score) totalGoals += match.result.team2Score;
    }

    if (match.participants) {
      match.participants.forEach(participant => {
        if (participant.assists) totalAssists += participant.assists;
      });
    }
  });

  return {
    totalMatches: matches.length,
    totalGoals,
    totalAssists
  };
}

async function calculateMyStats(matches, userId, dateFilter) {
  const myParticipations = await MatchParticipant.findAll({
    where: { userId },
    include: [
      {
        model: Match,
        as: 'match',
        where: {
          status: 'completed',
          ...dateFilter
        },
        required: true,
        include: [
          {
            model: MatchResult,
            as: 'result'
          }
        ]
      }
    ]
  });

  let totalGoals = 0;
  let totalAssists = 0;
  let totalMvp = 0;
  let wins = 0;

  myParticipations.forEach(participation => {
    totalGoals += participation.goals || 0;
    totalAssists += participation.assists || 0;

    const match = participation.match;
    if (match && match.result && match.result.mvpUserIds) {
      const mvpUserIds = match.result.mvpUserIds;
      if (Array.isArray(mvpUserIds) && mvpUserIds.includes(userId)) {
        totalMvp++;
      }
    }

    if (match && match.result) {
      const result = match.result;
      const userTeam = participation.team;

      if (userTeam === 1 && result.team1Score > result.team2Score) {
        wins++;
      } else if (userTeam === 2 && result.team2Score > result.team1Score) {
        wins++;
      }
    }
  });

  const matchesPlayed = myParticipations.length;
  const winRate = matchesPlayed > 0 ? (wins / matchesPlayed * 100) : 0;

  const totalMatchesInPeriod = matches.length;
  const attendance = totalMatchesInPeriod > 0 ? (matchesPlayed / totalMatchesInPeriod * 100) : 0;

  return {
    matches: matchesPlayed,
    goals: totalGoals,
    assists: totalAssists,
    mvp: totalMvp,
    winRate: parseFloat(winRate.toFixed(1)),
    attendance: parseFloat(attendance.toFixed(1))
  };
}

async function calculateMyRanking(matches, userId) {
  const userStats = {};

  for (const match of matches) {
    if (match.participants) {
      for (const participant of match.participants) {
        const uid = participant.userId;
        if (!userStats[uid]) {
          userStats[uid] = { goals: 0, assists: 0, matches: 0 };
        }
        userStats[uid].goals += participant.goals || 0;
        userStats[uid].assists += participant.assists || 0;
        userStats[uid].matches += 1;
      }
    }
  }

  const usersArray = Object.entries(userStats).map(([uid, stats]) => ({
    userId: uid,
    ...stats
  }));

  const goalRanking = [...usersArray].sort((a, b) => b.goals - a.goals);
  const goalsRank = goalRanking.findIndex(u => u.userId === userId) + 1;

  const assistRanking = [...usersArray].sort((a, b) => b.assists - a.assists);
  const assistsRank = assistRanking.findIndex(u => u.userId === userId) + 1;

  const attendanceRanking = [...usersArray].sort((a, b) => b.matches - a.matches);
  const attendanceRank = attendanceRanking.findIndex(u => u.userId === userId) + 1;

  return {
    goalsRank: goalsRank > 0 ? goalsRank : null,
    assistsRank: assistsRank > 0 ? assistsRank : null,
    attendanceRank: attendanceRank > 0 ? attendanceRank : null
  };
}

async function calculateTeamStats(matches, userId) {
  // Try to get team info from matches
  let myTeam = null;

  if (matches.length > 0) {
    // Find first match with valid team data
    for (const match of matches) {
      if (match.team1 && match.team1.name) {
        myTeam = match.team1;
        break;
      }
      if (match.team2 && match.team2.name) {
        myTeam = match.team2;
        break;
      }
    }
  }

  // If no team found from matches, try to get from user's current team
  if (!myTeam && userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'logo']
      }]
    });
    if (user && user.currentTeam) {
      myTeam = user.currentTeam;
    }
  }

  if (matches.length === 0) {
    return {
      name: myTeam ? myTeam.name : 'Unknown',
      logo: myTeam ? myTeam.logo : null,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      goalsFor: 0,
      goalsAgainst: 0
    };
  }

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  matches.forEach(match => {
    if (match.result) {
      const team1Score = match.result.team1Score || 0;
      const team2Score = match.result.team2Score || 0;

      goalsFor += team1Score;
      goalsAgainst += team2Score;

      if (team1Score > team2Score) {
        wins++;
      } else if (team1Score === team2Score) {
        draws++;
      } else {
        losses++;
      }
    }
  });

  const winRate = matches.length > 0 ? (wins / matches.length * 100) : 0;

  return {
    name: myTeam ? myTeam.name : 'Unknown',
    logo: myTeam ? myTeam.logo : null,
    matchesPlayed: matches.length,
    wins,
    draws,
    losses,
    winRate: parseFloat(winRate.toFixed(1)),
    goalsFor,
    goalsAgainst
  };
}

async function formatRecentMatches(matches, userId) {
  return matches.map(match => {
    const myParticipation = match.participants
      ? match.participants.find(p => p.userId === userId)
      : null;

    const myStats = {
      goals: myParticipation ? (myParticipation.goals || 0) : 0,
      assists: myParticipation ? (myParticipation.assists || 0) : 0
    };

    const mvpUserIds = match.result && match.result.mvpUserIds
      ? match.result.mvpUserIds
      : [];

    return {
      id: match.id,
      matchDate: match.matchDate ? match.matchDate.toISOString().split('T')[0] : null,
      team1: {
        id: match.team1 ? match.team1.id : null,
        name: match.team1 ? match.team1.name : 'Team 1'
      },
      team2: {
        id: match.team2 ? match.team2.id : null,
        name: match.team2 ? match.team2.name : 'Team 2'
      },
      result: {
        team1Goals: match.result ? (match.result.team1Score || 0) : 0,
        team2Goals: match.result ? (match.result.team2Score || 0) : 0
      },
      myStats,
      mvpUserIds
    };
  });
}

exports.getPlayerStats = async (userId, params) => {
  try {
    const { User, PlayerStat, Team, UserAchievement, Achievement } = require('../models');

    // 1. 获取用户基本信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber', 'position', 'leftFootSkill', 'rightFootSkill'],
      include: [{
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'color', 'logo']
      }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. 获取用户统计数据
    let playerStat = await PlayerStat.findOne({
      where: { userId }
    });

    // 如果没有统计记录，创建一个默认的
    if (!playerStat) {
      playerStat = {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        mvpCount: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winRate: '0.00',
        attendanceRate: '0.00',
        yellowCards: 0,
        redCards: 0
      };
    }

    // 3. 计算排名
    const rankings = {};

    // 射手榜排名
    if (playerStat.goals > 0) {
      const goalsRank = await PlayerStat.count({
        where: {
          goals: { [Op.gt]: playerStat.goals }
        }
      });
      rankings.goals = goalsRank + 1;
    } else {
      rankings.goals = null;
    }

    // 助攻榜排名
    if (playerStat.assists > 0) {
      const assistsRank = await PlayerStat.count({
        where: {
          assists: { [Op.gt]: playerStat.assists }
        }
      });
      rankings.assists = assistsRank + 1;
    } else {
      rankings.assists = null;
    }

    // MVP榜排名
    if (playerStat.mvpCount > 0) {
      const mvpRank = await PlayerStat.count({
        where: {
          mvpCount: { [Op.gt]: playerStat.mvpCount }
        }
      });
      rankings.mvp = mvpRank + 1;
    } else {
      rankings.mvp = null;
    }

    // 出勤榜排名（按到场次数）
    const attendanceRank = await PlayerStat.count({
      where: {
        [Op.or]: [
          { matchesPlayed: { [Op.gt]: playerStat.matchesPlayed } },
          {
            matchesPlayed: playerStat.matchesPlayed,
            attendanceRate: { [Op.gt]: playerStat.attendanceRate }
          }
        ]
      }
    });
    rankings.attendance = attendanceRank + 1;

    // 4. 获取成就列表
    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [{
        model: Achievement,
        as: 'achievement',
        attributes: ['code', 'name', 'description', 'icon']
      }]
    });

    const achievements = userAchievements.map(ua => ({
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      unlocked: true,
      unlockedAt: ua.unlockedAt
    }));

    // 5. 组装返回数据
    return {
      user: {
        id: user.id,
        realName: user.realName,
        nickname: user.nickname,
        avatar: user.avatar,
        jerseyNumber: user.jerseyNumber,
        position: user.position,
        leftFootSkill: user.leftFootSkill,
        rightFootSkill: user.rightFootSkill,
        currentTeam: user.currentTeam ? {
          id: user.currentTeam.id,
          name: user.currentTeam.name,
          color: user.currentTeam.color,
          logo: user.currentTeam.logo
        } : null
      },
      stats: {
        totalMatches: playerStat.matchesPlayed || 0,
        totalGoals: playerStat.goals || 0,
        totalAssists: playerStat.assists || 0,
        totalMVP: playerStat.mvpCount || 0,
        totalWins: playerStat.wins || 0,
        totalDraws: playerStat.draws || 0,
        totalLosses: playerStat.losses || 0,
        winRate: parseFloat(playerStat.winRate || 0),
        attendance: parseFloat(playerStat.attendanceRate || 0),
        yellowCards: playerStat.yellowCards || 0,
        redCards: playerStat.redCards || 0
      },
      rankings,
      achievements
    };
  } catch (error) {
    logger.error(`Get player stats failed: ${error.message}`);
    throw error;
  }
};

exports.getTeamStats = async (teamId, params) => {
  try {
    const { seasonId } = params;

    // Get team info
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Build match filter
    const matchWhere = {
      status: 'completed',
      [Op.or]: [
        { team1Id: teamId },
        { team2Id: teamId }
      ]
    };

    if (seasonId) {
      matchWhere.seasonId = seasonId;
    }

    // Get all matches for this team
    const matches = await Match.findAll({
      where: matchWhere,
      include: [
        {
          model: MatchResult,
          as: 'result',
          required: false
        }
      ],
      order: [['matchDate', 'DESC']]
    });

    // Calculate statistics
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    matches.forEach(match => {
      if (match.result) {
        const isTeam1 = match.team1Id === teamId;
        const winnerTeamId = match.result.winnerTeamId;

        // 使用进球数统计进球
        const team1Goals = match.result.team1TotalGoals || match.result.team1Score || 0;
        const team2Goals = match.result.team2TotalGoals || match.result.team2Score || 0;

        if (isTeam1) {
          goalsFor += team1Goals;
          goalsAgainst += team2Goals;

          // 使用winnerTeamId判断胜负
          if (winnerTeamId === teamId) {
            wins++;
          } else if (winnerTeamId === null) {
            draws++;
          } else {
            losses++;
          }
        } else {
          goalsFor += team2Goals;
          goalsAgainst += team1Goals;

          // 使用winnerTeamId判断胜负
          if (winnerTeamId === teamId) {
            wins++;
          } else if (winnerTeamId === null) {
            draws++;
          } else {
            losses++;
          }
        }
      }
    });

    const totalMatches = matches.length;
    const winRate = totalMatches > 0 ? (wins / totalMatches * 100) : 0;
    const avgGoalsFor = totalMatches > 0 ? (goalsFor / totalMatches) : 0;
    const avgGoalsAgainst = totalMatches > 0 ? (goalsAgainst / totalMatches) : 0;

    return {
      team: {
        id: team.id,
        name: team.name,
        logo: team.logo
      },
      stats: {
        totalMatches,
        wins,
        draws,
        losses,
        winRate: parseFloat(winRate.toFixed(1)),
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        avgGoalsFor: parseFloat(avgGoalsFor.toFixed(2)),
        avgGoalsAgainst: parseFloat(avgGoalsAgainst.toFixed(2))
      }
    };
  } catch (error) {
    logger.error(`Get team stats failed: ${error.message}`);
    throw error;
  }
};

/**
 * 获取排行榜
 * @param {string} type - 排行榜类型: goals(射手榜), assists(助攻榜), mvp(MVP榜), attendance(出勤榜)
 * @param {Object} params - 查询参数
 * @param {string} params.scope - 范围: all(全局), team(队内)
 * @param {string} params.teamId - 队伍ID (scope=team时必需)
 * @param {string} params.season - 赛季筛选
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
exports.getRanking = async (type, params = {}) => {
  try {
    const {
      scope = 'all',
      teamId,
      season,
      page = 1,
      pageSize = 50
    } = params;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 验证type参数
    const validTypes = ['goals', 'assists', 'mvp', 'attendance'];
    if (!validTypes.includes(type)) {
      throw new Error('Invalid ranking type');
    }

    // 根据type确定排序字段
    const orderFieldMap = {
      goals: 'goals',
      assists: 'assists',
      mvp: 'mvpCount',
      attendance: 'matchesPlayed'  // 出勤榜按到场次数排序
    };
    const orderField = orderFieldMap[type];

    // 构建查询条件
    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'realName', 'avatar', 'currentTeamId'],
        required: true,
        include: [
          {
            model: Team,
            as: 'currentTeam',
            attributes: ['id', 'name', 'color', 'logo'],
            required: false
          }
        ]
      }
    ];

    // 如果是队内排名,需要过滤队伍
    if (scope === 'team') {
      if (!teamId) {
        throw new Error('TeamId is required for team scope');
      }
      include[0].where = { currentTeamId: teamId };
    }

    // 构建查询条件
    const whereCondition = {};

    // 对于非出勤榜，只显示至少参加过1场比赛的球员
    // 对于出勤榜，显示所有球员（包括缺勤的）
    if (type !== 'attendance') {
      whereCondition.matchesPlayed = { [Op.gt]: 0 };
    }

    // 构建排序规则
    const orderRules = [[orderField, 'DESC']];

    // 对于非出勤榜，次要排序按参赛场次
    // 对于出勤榜，次要排序按出勤率
    if (type === 'attendance') {
      orderRules.push(['attendanceRate', 'DESC']);
    } else {
      orderRules.push(['matchesPlayed', 'DESC']);
    }

    // 第三排序：进球数
    orderRules.push(['goals', 'DESC']);

    // 查询PlayerStat数据
    const { count, rows } = await PlayerStat.findAndCountAll({
      include,
      where: whereCondition,
      order: orderRules,
      offset,
      limit
    });

    // 格式化返回数据
    const list = rows.map((stat, index) => {
      const baseData = {
        rank: offset + index + 1,
        userId: stat.userId,
        user: {
          id: stat.user.id,
          nickname: stat.user.nickname,
          realName: stat.user.realName,
          avatar: stat.user.avatar,
          currentTeam: stat.user.currentTeam ? {
            id: stat.user.currentTeam.id,
            name: stat.user.currentTeam.name,
            color: stat.user.currentTeam.color,
            logo: stat.user.currentTeam.logo
          } : null
        },
        matchesPlayed: stat.matchesPlayed
      };

      // 根据type添加对应的统计字段
      if (type === 'goals') {
        baseData.goals = stat.goals;
        baseData.assists = stat.assists; // 也显示助攻数
      } else if (type === 'assists') {
        baseData.assists = stat.assists;
        baseData.goals = stat.goals; // 也显示进球数
      } else if (type === 'mvp') {
        baseData.mvpCount = stat.mvpCount;
        baseData.goals = stat.goals;
        baseData.assists = stat.assists;
      } else if (type === 'attendance') {
        baseData.attendanceRate = parseFloat(stat.attendanceRate || 0);
        baseData.matchesPlayed = stat.matchesPlayed;
      }

      return baseData;
    });

    return {
      list,
      total: count,
      page: parseInt(page),
      pageSize: limit,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    logger.error(`Get ranking failed: ${error.message}`);
    throw error;
  }
};

exports.getTeamCompare = async (team1Id, team2Id) => {
  return { message: 'Not implemented yet' };
};

module.exports = exports;
