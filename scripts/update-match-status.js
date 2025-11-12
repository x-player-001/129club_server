/**
 * 更新比赛状态
 */
const { Match } = require('../src/models');

async function updateMatchStatus() {
  try {
    const matchId = 'f56a9312-44e4-4992-9e60-07e632241aec';

    const match = await Match.findByPk(matchId);
    if (!match) {
      console.error('❌ 比赛不存在');
      process.exit(1);
    }

    await match.update({ status: 'registration' });

    console.log('✅ 比赛状态已更新为 registration');
    console.log(`比赛ID: ${match.id}`);
    console.log(`比赛标题: ${match.title}`);
    console.log(`比赛状态: ${match.status}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

updateMatchStatus();
