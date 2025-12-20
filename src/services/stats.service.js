const { Match, MatchResult, MatchParticipant, Season, Team, User, PlayerStat, PlayerTeamStat } = require('../models');
const { Op, literal } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

exports.getOverview = async (userId, filterType = 'season', seasonId = null) => {
  try {
    const { seasonFilter, dateFilter } = await getDateFilter(filterType, seasonId);

    logger.info(`getOverview - filterType: ${filterType}, seasonId: ${seasonId}, seasonFilter: ${JSON.stringify(seasonFilter)}, dateFilter: ${JSON.stringify(dateFilter)}`);

    const matches = await Match.findAll({
      where: {
        status: 'completed',
        ...seasonFilter,
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
          attributes: ['id', 'name', 'logo', 'jerseyImage']
        },
        {
          model: Team,
          as: 'team2',
          attributes: ['id', 'name', 'logo', 'jerseyImage']
        }
      ],
      order: [['matchDate', 'DESC']]
    });

    logger.info(`getOverview - matches found: ${matches.length}`);

    const summary = await calculateSummary(matches, seasonFilter);
    const myStats = await calculateMyStats(matches, userId, seasonFilter, dateFilter);
    const myRanking = await calculateMyRanking(matches, userId, seasonFilter);
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

async function getDateFilter(filterType, seasonId = null) {
  const now = new Date();

  // 如果提供了显式的 seasonId，优先使用它
  if (seasonId) {
    return {
      seasonFilter: { seasonId },
      dateFilter: {}
    };
  }

  switch (filterType) {
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return {
        seasonFilter: {},
        dateFilter: {
          matchDate: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      };
    }

    case 'season': {
      const currentSeason = await Season.findOne({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']]
      });

      // 查询该赛季的所有比赛，不限制时间范围
      if (currentSeason) {
        return {
          seasonFilter: { seasonId: currentSeason.id },
          dateFilter: {}
        };
      }

      // 如果没有active赛季，查询最近30天
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return {
        seasonFilter: {},
        dateFilter: {
          matchDate: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      };
    }

    case 'all':
    default:
      return {
        seasonFilter: {},
        dateFilter: {}
      };
  }
}

async function calculateSummary(matches, seasonFilter) {
  let totalGoals = 0;
  let totalAssists = 0;

  // 计算总进球数（从比赛结果）
  matches.forEach(match => {
    if (match.result) {
      if (match.result.team1Score) totalGoals += match.result.team1Score;
      if (match.result.team2Score) totalGoals += match.result.team2Score;
    }
  });

  // 判断是否是赛季筛选
  const isSeasonFilter = seasonFilter && seasonFilter.seasonId;

  // 计算总助攻数（从球员统计表）
  if (isSeasonFilter) {
    // 从 PlayerTeamStat 聚合赛季数据
    const seasonStats = await PlayerTeamStat.findAll({
      where: { season: seasonFilter.seasonId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('assists')), 'totalAssists']
      ],
      raw: true
    });
    totalAssists = seasonStats[0]?.totalAssists || 0;
  } else {
    // 从 PlayerStat 全局统计
    const globalStats = await PlayerStat.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('assists')), 'totalAssists']
      ],
      raw: true
    });
    totalAssists = globalStats[0]?.totalAssists || 0;
  }

  return {
    totalMatches: matches.length,
    totalGoals,
    totalAssists
  };
}

async function calculateMyStats(matches, userId, seasonFilter, dateFilter) {
  const myParticipations = await MatchParticipant.findAll({
    where: { userId },
    include: [
      {
        model: Match,
        as: 'match',
        where: {
          status: 'completed',
          ...seasonFilter,
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

  // 判断是否是赛季筛选
  const isSeasonFilter = seasonFilter && seasonFilter.seasonId;

  if (isSeasonFilter) {
    // 从 PlayerTeamStat 聚合赛季数据
    const seasonStats = await PlayerTeamStat.findAll({
      where: { userId, season: seasonFilter.seasonId }
    });

    if (seasonStats.length > 0) {
      totalGoals = seasonStats.reduce((sum, s) => sum + s.goals, 0);
      totalAssists = seasonStats.reduce((sum, s) => sum + s.assists, 0);
      totalMvp = seasonStats.reduce((sum, s) => sum + s.mvpCount, 0);
    }
  } else {
    // 从 PlayerStat 获取累计数据
    const myPlayerStat = await PlayerStat.findOne({
      where: { userId }
    });

    totalGoals = myPlayerStat ? myPlayerStat.goals : 0;
    totalAssists = myPlayerStat ? myPlayerStat.assists : 0;
    totalMvp = myPlayerStat ? myPlayerStat.mvpCount : 0;
  }

  // 计算胜率（仅针对当前筛选的比赛）
  let wins = 0;
  myParticipations.forEach(participation => {
    const match = participation.match;
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

async function calculateMyRanking(matches, userId, seasonFilter) {
  // 判断是否是赛季筛选
  const isSeasonFilter = seasonFilter && seasonFilter.seasonId;

  if (isSeasonFilter) {
    // 从 PlayerTeamStat 聚合赛季数据
    const seasonStats = await PlayerTeamStat.findAll({
      where: { userId, season: seasonFilter.seasonId }
    });

    if (seasonStats.length === 0) {
      return {
        goalsRank: null,
        assistsRank: null,
        attendanceRank: null
      };
    }

    const myGoals = seasonStats.reduce((sum, s) => sum + s.goals, 0);
    const myAssists = seasonStats.reduce((sum, s) => sum + s.assists, 0);
    const myMatches = seasonStats.reduce((sum, s) => sum + s.matchesPlayed, 0);

    // 计算赛季排名（使用 SQL GROUP BY 聚合）
    const [goalsRankResult] = await sequelize.query(`
      SELECT COUNT(*) as \`rank\` FROM (
        SELECT user_id, SUM(goals) as total_goals, SUM(matches_played) as total_matches
        FROM player_team_stats
        WHERE season_id = :seasonId
        GROUP BY user_id
        HAVING total_goals > :goals OR (total_goals = :goals AND total_matches > :matches)
      ) as ranked_players
    `, {
      replacements: { seasonId: seasonFilter.seasonId, goals: myGoals, matches: myMatches },
      type: sequelize.QueryTypes.SELECT
    });

    const [assistsRankResult] = await sequelize.query(`
      SELECT COUNT(*) as \`rank\` FROM (
        SELECT user_id, SUM(assists) as total_assists, SUM(matches_played) as total_matches
        FROM player_team_stats
        WHERE season_id = :seasonId
        GROUP BY user_id
        HAVING total_assists > :assists OR (total_assists = :assists AND total_matches > :matches)
      ) as ranked_players
    `, {
      replacements: { seasonId: seasonFilter.seasonId, assists: myAssists, matches: myMatches },
      type: sequelize.QueryTypes.SELECT
    });

    // 出勤榜：赛季模式下使用比赛场次排名
    const [attendanceRankResult] = await sequelize.query(`
      SELECT COUNT(*) as \`rank\` FROM (
        SELECT user_id, SUM(matches_played) as total_matches
        FROM player_team_stats
        WHERE season_id = :seasonId
        GROUP BY user_id
        HAVING total_matches > :matches
      ) as ranked_players
    `, {
      replacements: { seasonId: seasonFilter.seasonId, matches: myMatches },
      type: sequelize.QueryTypes.SELECT
    });

    return {
      goalsRank: goalsRankResult.rank + 1,
      assistsRank: assistsRankResult.rank + 1,
      attendanceRank: attendanceRankResult.rank + 1
    };
  } else {
    // 从 PlayerStat 表获取排名数据（全局累计）
    const myStats = await PlayerStat.findOne({
      where: { userId }
    });

    if (!myStats) {
      return {
        goalsRank: null,
        assistsRank: null,
        attendanceRank: null
      };
    }

    // 射手榜排名：比我进球多的人数 + 1
    const goalsRank = await PlayerStat.count({
      where: {
        [Op.or]: [
          { goals: { [Op.gt]: myStats.goals } },
          {
            goals: myStats.goals,
            matchesPlayed: { [Op.gt]: myStats.matchesPlayed }
          }
        ]
      }
    });

    // 助攻榜排名：比我助攻多的人数 + 1
    const assistsRank = await PlayerStat.count({
      where: {
        [Op.or]: [
          { assists: { [Op.gt]: myStats.assists } },
          {
            assists: myStats.assists,
            matchesPlayed: { [Op.gt]: myStats.matchesPlayed }
          }
        ]
      }
    });

    // 出勤榜排名：比我出勤多的人数 + 1
    const attendanceRank = await PlayerStat.count({
      where: {
        [Op.or]: [
          { matchesPlayed: { [Op.gt]: myStats.matchesPlayed } },
          {
            matchesPlayed: myStats.matchesPlayed,
            attendanceRate: { [Op.gt]: myStats.attendanceRate }
          }
        ]
      }
    });

    return {
      goalsRank: goalsRank + 1,
      assistsRank: assistsRank + 1,
      attendanceRank: attendanceRank + 1
    };
  }
}

async function calculateTeamStats(matches, userId) {
  // 优先从用户的 currentTeam 获取队伍信息
  let myTeam = null;

  if (userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'logo', 'jerseyImage']
      }]
    });
    if (user && user.currentTeam) {
      myTeam = user.currentTeam;
    }
  }

  // 如果用户没有设置当前队伍，从比赛参与记录中查找
  if (!myTeam && matches.length > 0) {
    for (const match of matches) {
      // 通过 participants 找到用户所在的队伍
      const userParticipation = match.participants?.find(p => p.userId === userId);
      if (userParticipation) {
        const userTeamNumber = userParticipation.team; // 1 或 2
        if (userTeamNumber === 1 && match.team1) {
          myTeam = match.team1;
          break;
        } else if (userTeamNumber === 2 && match.team2) {
          myTeam = match.team2;
          break;
        }
      }
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

exports.getPlayerStats = async (userId, params = {}) => {
  try {
    const { seasonId, season } = params;
    // 兼容旧参数名，优先使用 seasonId
    const actualSeasonId = seasonId || season;
    const { User, PlayerStat, Team, UserAchievement, Achievement } = require('../models');

    // 1. 获取用户基本信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'realName', 'nickname', 'avatar', 'jerseyNumber', 'position', 'leftFootSkill', 'rightFootSkill'],
      include: [{
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'color', 'logo', 'jerseyImage']
      }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. 判断是否查询赛季数据
    let usePlayerTeamStat = false;
    if (actualSeasonId) {
      usePlayerTeamStat = true;
    }

    // 3. 获取用户统计数据
    let playerStat;
    if (usePlayerTeamStat) {
      // 查询赛季数据 - 从 PlayerTeamStat 表
      // 球员可能在一个赛季中为多个队伍效力，需要汇总
      const seasonStats = await PlayerTeamStat.findAll({
        where: { userId, season: actualSeasonId }
      });

      if (seasonStats.length > 0) {
        // 汇总该球员在该赛季所有队伍的数据
        playerStat = {
          matchesPlayed: seasonStats.reduce((sum, s) => sum + s.matchesPlayed, 0),
          goals: seasonStats.reduce((sum, s) => sum + s.goals, 0),
          assists: seasonStats.reduce((sum, s) => sum + s.assists, 0),
          mvpCount: seasonStats.reduce((sum, s) => sum + s.mvpCount, 0),
          wins: seasonStats.reduce((sum, s) => sum + s.wins, 0),
          draws: seasonStats.reduce((sum, s) => sum + s.draws, 0),
          losses: seasonStats.reduce((sum, s) => sum + s.losses, 0),
          yellowCards: seasonStats.reduce((sum, s) => sum + s.yellowCards, 0),
          redCards: seasonStats.reduce((sum, s) => sum + s.redCards, 0)
        };
        // 计算胜率
        const totalMatches = playerStat.wins + playerStat.draws + playerStat.losses;
        playerStat.winRate = totalMatches > 0 ? ((playerStat.wins / totalMatches) * 100).toFixed(2) : '0.00';
        playerStat.attendanceRate = '0.00'; // 赛季数据暂不计算出勤率
      } else {
        playerStat = null;
      }
    } else {
      // 查询总统计数据 - 从 PlayerStat 表
      playerStat = await PlayerStat.findOne({
        where: { userId }
      });
    }

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

    // 4. 计算排名（使用相应的数据源）
    const rankings = {};
    const RankModel = usePlayerTeamStat ? PlayerTeamStat : PlayerStat;
    const rankWhere = usePlayerTeamStat ? { season: seasonId } : {};

    // 射手榜排名
    if (playerStat.goals > 0) {
      let goalsRank;
      if (usePlayerTeamStat) {
        // 赛季排名：需要按userId分组汇总后排名
        const [result] = await sequelize.query(`
          SELECT COUNT(*) as \`rank\` FROM (
            SELECT user_id, SUM(goals) as total_goals
            FROM player_team_stats
            WHERE season_id = :seasonId
            GROUP BY user_id
            HAVING total_goals > :goals
          ) as ranked_players
        `, {
          replacements: { seasonId, goals: playerStat.goals },
          type: sequelize.QueryTypes.SELECT
        });
        goalsRank = result.rank;
      } else {
        goalsRank = await PlayerStat.count({
          where: { goals: { [Op.gt]: playerStat.goals } }
        });
      }
      rankings.goals = goalsRank + 1;
    } else {
      rankings.goals = null;
    }

    // 助攻榜排名
    if (playerStat.assists > 0) {
      let assistsRank;
      if (usePlayerTeamStat) {
        const [result] = await sequelize.query(`
          SELECT COUNT(*) as \`rank\` FROM (
            SELECT user_id, SUM(assists) as total_assists
            FROM player_team_stats
            WHERE season_id = :seasonId
            GROUP BY user_id
            HAVING total_assists > :assists
          ) as ranked_players
        `, {
          replacements: { seasonId, assists: playerStat.assists },
          type: sequelize.QueryTypes.SELECT
        });
        assistsRank = result.rank;
      } else {
        assistsRank = await PlayerStat.count({
          where: { assists: { [Op.gt]: playerStat.assists } }
        });
      }
      rankings.assists = assistsRank + 1;
    } else {
      rankings.assists = null;
    }

    // MVP榜排名
    if (playerStat.mvpCount > 0) {
      let mvpRank;
      if (usePlayerTeamStat) {
        const [result] = await sequelize.query(`
          SELECT COUNT(*) as \`rank\` FROM (
            SELECT user_id, SUM(mvp_count) as total_mvp
            FROM player_team_stats
            WHERE season_id = :seasonId
            GROUP BY user_id
            HAVING total_mvp > :mvpCount
          ) as ranked_players
        `, {
          replacements: { seasonId, mvpCount: playerStat.mvpCount },
          type: sequelize.QueryTypes.SELECT
        });
        mvpRank = result.rank;
      } else {
        mvpRank = await PlayerStat.count({
          where: { mvpCount: { [Op.gt]: playerStat.mvpCount } }
        });
      }
      rankings.mvp = mvpRank + 1;
    } else {
      rankings.mvp = null;
    }

    // 出勤榜排名（只在总统计中有效）
    if (!usePlayerTeamStat) {
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
    } else {
      rankings.attendance = null; // 赛季数据不计算出勤排名
    }

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
      seasonId,
      season,  // 兼容旧参数名
      page = 1,
      pageSize = 50
    } = params;

    // 优先使用 seasonId
    const actualSeasonId = seasonId || season;

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

    // 如果提供了seasonId，使用 PlayerTeamStat 表
    let usePlayerTeamStat = false;
    if (actualSeasonId) {
      usePlayerTeamStat = true;
    }

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
            attributes: ['id', 'name', 'color', 'logo', 'jerseyImage'],
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

    // 如果查询赛季数据，添加赛季筛选
    if (usePlayerTeamStat && actualSeasonId) {
      whereCondition.season = actualSeasonId;
    }

    // 对于非出勤榜，只显示至少参加过1场比赛的球员
    if (type !== 'attendance') {
      whereCondition.matchesPlayed = { [Op.gt]: 0 };
    }

    // 构建排序规则
    const orderRules = [[orderField, 'DESC']];

    // 对于非出勤榜，次要排序按参赛场次
    // 对于出勤榜，PlayerTeamStat没有attendanceRate字段，只按matchesPlayed排序
    if (type === 'attendance' && !usePlayerTeamStat) {
      orderRules.push(['attendanceRate', 'DESC']);
    } else {
      orderRules.push(['matchesPlayed', 'DESC']);
    }

    // 第三排序：进球数
    orderRules.push(['goals', 'DESC']);

    // 根据是否查询赛季数据，选择使用 PlayerTeamStat 或 PlayerStat
    const Model = usePlayerTeamStat ? PlayerTeamStat : PlayerStat;
    const { count, rows } = await Model.findAndCountAll({
      include,
      where: whereCondition,
      order: orderRules,
      offset,
      limit
    });

    // 如果是出勤榜且使用 PlayerTeamStat，需要计算队伍总场次来算出勤率
    let teamMatchCounts = {};
    if (type === 'attendance' && usePlayerTeamStat) {
      const { Team } = require('../models');
      // 获取所有涉及的队伍及其总场次
      const teamIds = [...new Set(rows.map(r => r.teamId))];
      for (const teamId of teamIds) {
        const teamMatchCount = await Match.count({
          where: {
            status: 'completed',
            seasonId: actualSeasonId,
            [Op.or]: [
              { team1Id: teamId },
              { team2Id: teamId }
            ]
          }
        });
        teamMatchCounts[teamId] = teamMatchCount;
      }
    }

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
        // 如果使用 PlayerTeamStat，动态计算出勤率
        if (usePlayerTeamStat && stat.teamId && teamMatchCounts[stat.teamId]) {
          const teamTotal = teamMatchCounts[stat.teamId];
          baseData.attendanceRate = teamTotal > 0
            ? parseFloat(((stat.matchesPlayed / teamTotal) * 100).toFixed(2))
            : 0;
        } else {
          // 使用 PlayerStat 的 attendanceRate 字段
          baseData.attendanceRate = parseFloat(stat.attendanceRate || 0);
        }
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
