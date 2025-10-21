const Season = require('../models/Season');
const Match = require('../models/Match');
const Team = require('../models/Team');
const MatchResult = require('../models/MatchResult');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * 创建赛季
 * @param {Object} data 赛季数据
 * @param {string} userId 创建者ID
 */
exports.createSeason = async (data, userId) => {
  const { name, title, description, startDate, endDate, maxMatches } = data;

  // name可以重复,不需要检查唯一性

  // 创建赛季
  const season = await Season.create({
    name,
    title: title || null,
    description: description || null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    maxMatches: maxMatches || 10,
    status: 'upcoming',
    createdBy: userId
  });

  logger.info(`Season created: ${season.id}, ${season.name}`);

  return season;
};

/**
 * 获取赛季列表
 * @param {Object} params 查询参数
 */
exports.getSeasonList = async (params) => {
  const { status, page = 1, limit = 20 } = params;

  const where = {};
  if (status) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Season.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    list: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * 获取赛季详情（包含比赛列表）
 * @param {string} seasonId 赛季ID
 */
exports.getSeasonDetail = async (seasonId) => {
  const season = await Season.findByPk(seasonId);

  if (!season) {
    throw new Error('赛季不存在');
  }

  // 获取该赛季的所有比赛
  const matches = await Match.findAll({
    where: { seasonId },
    include: [
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

  return {
    ...season.toJSON(),
    matches,
    matchCount: matches.length
  };
};

/**
 * 更新赛季信息
 * @param {string} seasonId 赛季ID
 * @param {Object} data 更新数据
 */
exports.updateSeason = async (seasonId, data) => {
  const season = await Season.findByPk(seasonId);

  if (!season) {
    throw new Error('赛季不存在');
  }

  // 允许更新的字段（包括name）
  const allowedFields = ['name', 'title', 'description', 'startDate', 'endDate', 'maxMatches', 'status'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      if (field === 'startDate' || field === 'endDate') {
        updateData[field] = data[field] ? new Date(data[field]) : null;
      } else if (field === 'status' && data[field] === 'completed') {
        // 标记为完成时，记录完成时间
        updateData[field] = data[field];
        updateData.completedAt = new Date();
      } else {
        updateData[field] = data[field];
      }
    }
  });

  await season.update(updateData);

  logger.info(`Season updated: ${seasonId}`);

  return season;
};

/**
 * 删除赛季
 * @param {string} seasonId 赛季ID
 */
exports.deleteSeason = async (seasonId) => {
  const season = await Season.findByPk(seasonId);

  if (!season) {
    throw new Error('赛季不存在');
  }

  // 检查是否有关联的比赛
  const matchCount = await Match.count({ where: { seasonId } });
  if (matchCount > 0) {
    throw new Error(`该赛季有${matchCount}场比赛，无法删除。请先删除或移除比赛的赛季关联。`);
  }

  await season.destroy();

  logger.info(`Season deleted: ${seasonId}`);

  return { message: '赛季已删除' };
};

/**
 * 获取赛季统计数据
 * @param {string} seasonId 赛季ID
 */
exports.getSeasonStatistics = async (seasonId) => {
  const season = await Season.findByPk(seasonId);

  if (!season) {
    throw new Error('赛季不存在');
  }

  // 获取该赛季的所有已完成比赛
  const matches = await Match.findAll({
    where: {
      seasonId,
      status: 'completed'
    },
    include: [
      {
        model: MatchResult,
        as: 'result'
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
    ]
  });

  // 统计每个队伍的得分
  const teamStats = {};

  matches.forEach(match => {
    const team1Id = match.team1Id;
    const team2Id = match.team2Id;
    const result = match.result;

    // 初始化队伍统计
    if (!teamStats[team1Id]) {
      teamStats[team1Id] = {
        teamId: team1Id,
        teamName: match.team1.name,
        teamLogo: match.team1.logo,
        totalScore: 0,
        totalGoals: 0,
        matchCount: 0,
        winCount: 0,
        loseCount: 0
      };
    }
    if (!teamStats[team2Id]) {
      teamStats[team2Id] = {
        teamId: team2Id,
        teamName: match.team2.name,
        teamLogo: match.team2.logo,
        totalScore: 0,
        totalGoals: 0,
        matchCount: 0,
        winCount: 0,
        loseCount: 0
      };
    }

    // 累加积分和进球数（根据4节制或传统制）
    if (match.quarterSystem && result) {
      // 4节制：使用result中的team1FinalScore和team2FinalScore
      teamStats[team1Id].totalScore += result.team1FinalScore || 0;
      teamStats[team2Id].totalScore += result.team2FinalScore || 0;
      teamStats[team1Id].totalGoals += result.team1TotalGoals || 0;
      teamStats[team2Id].totalGoals += result.team2TotalGoals || 0;

      // 判断胜负
      if (result.team1FinalScore > result.team2FinalScore) {
        teamStats[team1Id].winCount++;
        teamStats[team2Id].loseCount++;
      } else if (result.team1FinalScore < result.team2FinalScore) {
        teamStats[team2Id].winCount++;
        teamStats[team1Id].loseCount++;
      }
    } else {
      // 传统制：使用match中的finalTeam1Score和finalTeam2Score（进球数）
      teamStats[team1Id].totalGoals += match.finalTeam1Score || 0;
      teamStats[team2Id].totalGoals += match.finalTeam2Score || 0;

      // 传统制积分规则：赢3分，平1分，输0分
      if (match.finalTeam1Score > match.finalTeam2Score) {
        teamStats[team1Id].totalScore += 3;
        teamStats[team1Id].winCount++;
        teamStats[team2Id].loseCount++;
      } else if (match.finalTeam1Score < match.finalTeam2Score) {
        teamStats[team2Id].totalScore += 3;
        teamStats[team2Id].winCount++;
        teamStats[team1Id].loseCount++;
      } else {
        teamStats[team1Id].totalScore += 1;
        teamStats[team2Id].totalScore += 1;
      }
    }

    teamStats[team1Id].matchCount++;
    teamStats[team2Id].matchCount++;
  });

  // 转换为数组并排序（按总分降序）
  const rankings = Object.values(teamStats).sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // 积分相同，按进球数排序
    return b.totalGoals - a.totalGoals;
  });

  return {
    season: season.toJSON(),
    totalMatches: matches.length,
    completedMatches: matches.length,
    rankings
  };
};

/**
 * 激活赛季（设置为active状态）
 * @param {string} seasonId 赛季ID
 */
exports.activateSeason = async (seasonId) => {
  const season = await Season.findByPk(seasonId);

  if (!season) {
    throw new Error('赛季不存在');
  }

  if (season.status === 'active') {
    throw new Error('赛季已经是激活状态');
  }

  await season.update({ status: 'active' });

  logger.info(`Season activated: ${seasonId}`);

  return season;
};

/**
 * 完成赛季（设置为completed状态）
 * @param {string} seasonId 赛季ID
 */
exports.completeSeason = async (seasonId) => {
  const season = await Season.findByPk(seasonId);

  if (!season) {
    throw new Error('赛季不存在');
  }

  if (season.status === 'completed') {
    throw new Error('赛季已经完成');
  }

  await season.update({
    status: 'completed',
    completedAt: new Date()
  });

  logger.info(`Season completed: ${seasonId}`);

  return season;
};
