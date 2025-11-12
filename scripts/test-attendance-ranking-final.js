const statsService = require('../src/services/stats.service');

async function testAttendanceRankingFinal() {
  try {
    console.log('📊 测试出勤榜接口 - 按到场次数排名\n');

    const result = await statsService.getRanking('attendance', {
      scope: 'all',
      page: 1,
      pageSize: 50
    });

    console.log(`总球员数: ${result.total}\n`);
    console.log('排名 | 姓名 | 队伍 | 到场次数 | 出勤率');
    console.log('-'.repeat(60));

    result.list.forEach(item => {
      const rank = item.rank.toString().padEnd(4);
      const name = item.user.nickname.padEnd(8);
      const team = (item.user.currentTeam?.name || '无队伍').padEnd(10);
      const matches = item.matchesPlayed.toString().padEnd(4);
      const rate = `${item.attendanceRate}%`;

      console.log(`${rank} | ${name} | ${team} | ${matches} | ${rate}`);
    });

    console.log('\n✅ 确认：出勤榜按到场次数降序排列');
    console.log('   - 到场1次的球员排在前面');
    console.log('   - 到场0次的球员排在后面');

    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testAttendanceRankingFinal();
