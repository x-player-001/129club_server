/**
 * 修复 player_stats 表中的胜负数据
 * 根据 match_participants 和 match_results 重新计算每个球员的胜负场次和胜率
 */

const { Sequelize, Op } = require('sequelize');
const config = require('../src/config');

// 创建数据库连接
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: console.log,
    timezone: '+08:00'
  }
);

async function fixPlayerWins() {
  try {
    console.log('开始修复球员胜负数据...\n');

    // 1. 获取所有球员的统计记录
    const [playerStats] = await sequelize.query(`
      SELECT user_id FROM player_stats
    `);

    console.log(`找到 ${playerStats.length} 个球员需要更新\n`);

    let updatedCount = 0;

    // 2. 为每个球员重新计算胜负数据
    for (const player of playerStats) {
      const userId = player.user_id;

      // 获取该球员参加的所有已完成比赛
      const [matches] = await sequelize.query(`
        SELECT
          m.id as match_id,
          mp.team_id as player_team_id,
          m.quarter_system,
          mr.winner_team_id,
          CASE
            WHEN m.quarter_system = 1 THEN COALESCE(mr.team1_final_score, mr.team1_score)
            ELSE m.final_team1_score
          END as team1_score,
          CASE
            WHEN m.quarter_system = 1 THEN COALESCE(mr.team2_final_score, mr.team2_score)
            ELSE m.final_team2_score
          END as team2_score,
          m.team1_id,
          m.team2_id
        FROM match_participants mp
        INNER JOIN matches m ON mp.match_id = m.id
        LEFT JOIN match_results mr ON m.id = mr.match_id
        WHERE mp.user_id = :userId
          AND m.status = 'completed'
      `, {
        replacements: { userId }
      });

      if (matches.length === 0) {
        console.log(`用户 ${userId}: 没有参加已完成的比赛`);
        continue;
      }

      // 计算胜负数据
      let wins = 0;
      let draws = 0;
      let losses = 0;

      matches.forEach(match => {
        const { player_team_id, team1_id, team2_id, team1_score, team2_score, winner_team_id } = match;

        // 优先检查是否有明确的胜者（包括点球决出的胜者）
        if (winner_team_id) {
          if (winner_team_id === player_team_id) {
            wins++;
          } else {
            losses++;
          }
          return;
        }

        // 没有明确胜者，通过比分判断
        let myScore, opponentScore;
        if (player_team_id === team1_id) {
          myScore = team1_score || 0;
          opponentScore = team2_score || 0;
        } else if (player_team_id === team2_id) {
          myScore = team2_score || 0;
          opponentScore = team1_score || 0;
        } else {
          console.warn(`  警告: 比赛 ${match.match_id} 中球员队伍不匹配`);
          return;
        }

        // 统计胜负平
        if (myScore > opponentScore) {
          wins++;
        } else if (myScore === opponentScore) {
          draws++;
        } else {
          losses++;
        }
      });

      // 计算胜率
      const totalMatches = wins + draws + losses;
      const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : '0.00';

      // 更新数据库
      await sequelize.query(`
        UPDATE player_stats
        SET
          wins = :wins,
          draws = :draws,
          losses = :losses,
          win_rate = :winRate
        WHERE user_id = :userId
      `, {
        replacements: { userId, wins, draws, losses, winRate },
        type: Sequelize.QueryTypes.UPDATE
      });

      updatedCount++;
      console.log(`✓ 用户 ${userId}: ${totalMatches}场 (${wins}胜${draws}平${losses}负) 胜率${winRate}%`);
    }

    console.log(`\n修复完成！共更新 ${updatedCount} 个球员的数据`);

  } catch (error) {
    console.error('修复失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixPlayerWins()
  .then(() => {
    console.log('\n✓ 所有数据已成功修复');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ 修复过程中出错:', error);
    process.exit(1);
  });
