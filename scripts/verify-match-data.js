/**
 * 验证比赛数据脚本
 */

const sequelize = require('../src/config/database');
const {
  Match, Registration, Lineup, MatchEvent, MatchResult
} = require('../src/models');
const logger = require('../src/utils/logger');

async function verifyMatchData() {
  try {
    logger.info('开始验证比赛数据...');

    // 统计各表数据
    const matchCount = await Match.count();
    const regCount = await Registration.count();
    const lineupCount = await Lineup.count();
    const eventCount = await MatchEvent.count();
    const resultCount = await MatchResult.count();

    console.log('\n=== 数据统计 ===');
    console.log(`比赛总数: ${matchCount}`);
    console.log(`报名记录: ${regCount}`);
    console.log(`阵容记录: ${lineupCount}`);
    console.log(`比赛事件: ${eventCount}`);
    console.log(`比赛结果: ${resultCount}`);

    // 查看比赛详情
    const matches = await Match.findAll({
      order: [['matchDate', 'DESC']]
    });

    console.log('\n=== 比赛列表 ===');
    for (const match of matches) {
      console.log(`\n${match.title} (${match.status})`);
      console.log(`  时间: ${match.matchDate.toISOString()}`);
      console.log(`  地点: ${match.location}`);

      // 查看报名情况
      const regs = await Registration.count({ where: { matchId: match.id } });
      console.log(`  报名人数: ${regs}`);

      // 如果已完成，查看结果
      if (match.status === 'completed') {
        const result = await MatchResult.findOne({ where: { matchId: match.id } });
        if (result) {
          console.log(`  比分: ${result.team1Score}:${result.team2Score}`);
          console.log(`  总结: ${result.summary}`);
        }

        const events = await MatchEvent.count({ where: { matchId: match.id } });
        console.log(`  事件数: ${events}`);
      }
    }

    // 按事件类型统计
    console.log('\n=== 事件统计 ===');
    const eventTypes = await MatchEvent.findAll({
      attributes: [
        'eventType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['eventType']
    });

    eventTypes.forEach(et => {
      console.log(`${et.eventType}: ${et.get('count')}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('验证失败:', error);
    console.error(error);
    process.exit(1);
  }
}

verifyMatchData();
