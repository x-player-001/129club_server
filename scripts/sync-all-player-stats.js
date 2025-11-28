const { recalculatePlayerStats } = require('../src/services/quarter.service');
const { MatchParticipant, Match } = require('../src/models');
const logger = require('../src/utils/logger');

async function syncAllPlayerStats() {
  try {
    console.log('开始同步所有球员统计数据...');

    // 获取所有已完成比赛的参赛球员（去重）
    const participants = await MatchParticipant.findAll({
      attributes: ['userId'],
      include: [{
        model: Match,
        as: 'match',
        where: { status: 'completed' },
        attributes: []
      }],
      group: ['userId']
    });

    console.log(`找到 ${participants.length} 位球员需要同步统计数据`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      try {
        console.log(`[${i + 1}/${participants.length}] 正在同步球员 ${participant.userId} ...`);
        await recalculatePlayerStats(participant.userId);
        successCount++;
      } catch (error) {
        console.error(`❌ 同步失败: ${participant.userId}`, error.message);
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('✅ 同步完成！');
    console.log(`成功: ${successCount} 位球员`);
    console.log(`失败: ${errorCount} 位球员`);
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

syncAllPlayerStats();
