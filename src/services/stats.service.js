const { Match, MatchResult, MatchParticipant, Season, Team, User } = require('../models');
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
  return { message: 'Not implemented yet' };
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
        const team1Score = match.result.team1Score || 0;
        const team2Score = match.result.team2Score || 0;

        if (isTeam1) {
          goalsFor += team1Score;
          goalsAgainst += team2Score;

          if (team1Score > team2Score) wins++;
          else if (team1Score === team2Score) draws++;
          else losses++;
        } else {
          goalsFor += team2Score;
          goalsAgainst += team1Score;

          if (team2Score > team1Score) wins++;
          else if (team2Score === team1Score) draws++;
          else losses++;
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

exports.getRanking = async (type, params) => {
  return { message: 'Not implemented yet' };
};

exports.getTeamCompare = async (team1Id, team2Id) => {
  return { message: 'Not implemented yet' };
};

module.exports = exports;
