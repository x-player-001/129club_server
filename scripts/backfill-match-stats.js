/**
 * 回填已完成比赛的统计数据
 * Backfill statistics for completed matches
 */

const sequelize = require('../src/config/database');
const { Match, TeamStat, PlayerStat, MatchEvent, MatchParticipant, Season } = require('../src/models');
const logger = console;

/**
 * 更新单个队伍的统计数据
 */
async function updateSingleTeamStats(teamId, season, isWin, isDraw, goalsFor, goalsAgainst) {
  const [teamStat, created] = await TeamStat.findOrCreate({
    where: { teamId, season },
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

  // 更新统计
  teamStat.matchesPlayed += 1;

  if (isWin) {
    teamStat.wins += 1;
    teamStat.points += 3;
  } else if (isDraw) {
    teamStat.draws += 1;
    teamStat.points += 1;
  } else {
    teamStat.losses += 1;
  }

  teamStat.goalsFor += goalsFor;
  teamStat.goalsAgainst += goalsAgainst;
  teamStat.goalDifference = teamStat.goalsFor - teamStat.goalsAgainst;
  teamStat.winRate = ((teamStat.wins / teamStat.matchesPlayed) * 100).toFixed(2);

  await teamStat.save();

  logger.info(`✅ Team stats updated for team ${teamId}: ${teamStat.wins}W ${teamStat.draws}D ${teamStat.losses}L, ${teamStat.goalsFor} goals`);
}

/**
 * 更新队伍统计数据
 */
async function updateTeamStats(match) {
  const { MatchQuarter } = require('../src/models');

  // 获取赛季信息
  const season = await Season.findByPk(match.seasonId);
  const seasonName = season ? season.name : '未知赛季';

  // 获取所有节次数据
  const quarters = await MatchQuarter.findAll({
    where: { matchId: match.id },
    order: [['quarter_number', 'ASC']]
  });

  // 计算总进球和总得分
  let team1Goals = 0;
  let team2Goals = 0;
  let team1Points = 0;
  let team2Points = 0;

  quarters.forEach(quarter => {
    team1Goals += quarter.team1Goals || 0;
    team2Goals += quarter.team2Goals || 0;
    team1Points += quarter.team1Points || 0;
    team2Points += quarter.team2Points || 0;
  });

  let winnerTeamId = null;
  if (team1Points > team2Points) {
    winnerTeamId = match.team1Id;
  } else if (team2Points > team1Points) {
    winnerTeamId = match.team2Id;
  }

  const isDraw = winnerTeamId === null;

  logger.info(`  Team 1 Goals: ${team1Goals}, Team 2 Goals: ${team2Goals}`);
  logger.info(`  Team 1 Points: ${team1Points}, Team 2 Points: ${team2Points}`);
  logger.info(`  Result: ${isDraw ? 'Draw' : `Winner: Team ${winnerTeamId === match.team1Id ? '1' : '2'}`}`);

  // 更新队伍1统计
  await updateSingleTeamStats(
    match.team1Id,
    seasonName,
    match.team1Id === winnerTeamId,
    isDraw,
    team1Goals,
    team2Goals
  );

  // 更新队伍2统计
  await updateSingleTeamStats(
    match.team2Id,
    seasonName,
    match.team2Id === winnerTeamId,
    isDraw,
    team2Goals,
    team1Goals
  );
}

/**
 * 更新球员统计数据
 */
async function updatePlayerStats(matchId) {
  // 获取比赛事件统计
  const events = await MatchEvent.findAll({
    where: { matchId }
  });

  // 获取到场人员
  const participants = await MatchParticipant.findAll({
    where: { matchId }
  });

  // 统计每个球员的数据
  const playerStats = {};

  // 统计事件
  events.forEach(event => {
    if (!playerStats[event.userId]) {
      playerStats[event.userId] = { goals: 0, assists: 0 };
    }

    if (event.eventType === 'goal') {
      playerStats[event.userId].goals += 1;
    }

    // 处理助攻
    if (event.assistUserId) {
      if (!playerStats[event.assistUserId]) {
        playerStats[event.assistUserId] = { goals: 0, assists: 0 };
      }
      playerStats[event.assistUserId].assists += 1;
    }
  });

  // 更新每个参赛球员的统计
  for (const participant of participants) {
    const userId = participant.userId;

    const [playerStat, created] = await PlayerStat.findOrCreate({
      where: { userId },
      defaults: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winRate: '0.00'
      }
    });

    // 更新比赛场次
    playerStat.matchesPlayed += 1;

    // 更新进球和助攻
    if (playerStats[userId]) {
      playerStat.goals += playerStats[userId].goals || 0;
      playerStat.assists += playerStats[userId].assists || 0;
    }

    await playerStat.save();

    const stats = playerStats[userId] || { goals: 0, assists: 0 };
    logger.info(`✅ Player stats updated for user ${userId}: ${playerStat.matchesPlayed} matches, ${stats.goals} goals, ${stats.assists} assists`);
  }
}

/**
 * 主函数：回填所有已完成比赛的统计数据
 */
async function backfillMatchStats() {
  try {
    logger.info('🚀 Starting to backfill match statistics...\n');

    // 查询所有已完成的比赛
    const completedMatches = await Match.findAll({
      where: {
        status: 'completed'
      },
      order: [['match_date', 'ASC']]
    });

    logger.info(`📊 Found ${completedMatches.length} completed matches\n`);

    if (completedMatches.length === 0) {
      logger.info('✅ No completed matches found. Nothing to backfill.');
      return;
    }

    // 处理每场比赛
    for (let i = 0; i < completedMatches.length; i++) {
      const match = completedMatches[i];
      logger.info(`\n--- Processing match ${i + 1}/${completedMatches.length} ---`);
      logger.info(`Match ID: ${match.id}`);
      logger.info(`Match Date: ${match.matchDate}`);

      try {
        // 更新队伍统计
        await updateTeamStats(match);

        // 更新球员统计
        await updatePlayerStats(match.id);

        logger.info(`✅ Match ${match.id} statistics updated successfully`);
      } catch (error) {
        logger.error(`❌ Error processing match ${match.id}:`, error.message);
      }
    }

    logger.info('\n\n🎉 Backfill completed!');
    logger.info('\n📊 Final Statistics:');

    // 显示最终统计结果
    const teamStats = await TeamStat.findAll();
    logger.info(`\nTeam Stats: ${teamStats.length} records`);
    teamStats.forEach(stat => {
      logger.info(`  - Team ${stat.teamId} (${stat.season}): ${stat.matchesPlayed} matches, ${stat.wins}W ${stat.draws}D ${stat.losses}L, ${stat.points} pts`);
    });

    const playerStats = await PlayerStat.findAll();
    logger.info(`\nPlayer Stats: ${playerStats.length} records`);
    logger.info(`  (${playerStats.length} players have statistics recorded)`);

  } catch (error) {
    logger.error('❌ Error during backfill:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  backfillMatchStats()
    .then(() => {
      logger.info('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { backfillMatchStats };
