const statsService = require('../src/services/stats.service');

async function testAttendanceRanking() {
  try {
    console.log('📊 测试出勤榜接口\n');

    // 测试全局出勤榜
    const globalRanking = await statsService.getRanking('attendance', {
      scope: 'all',
      page: 1,
      pageSize: 10
    });

    console.log('全局出勤榜:');
    console.log(`总数: ${globalRanking.total}`);
    console.log(`当前页: ${globalRanking.page}/${globalRanking.totalPages}\n`);

    globalRanking.list.forEach((item, index) => {
      console.log(`${item.rank}. ${item.user.nickname} (${item.user.currentTeam?.name || '无队伍'})`);
      console.log(`   出勤率: ${item.attendanceRate}%`);
      console.log(`   参赛场次: ${item.matchesPlayed}`);
      console.log('');
    });

    console.log('✅ 出勤榜接口测试成功！');
    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testAttendanceRanking();
