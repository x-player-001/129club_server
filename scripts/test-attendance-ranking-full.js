const statsService = require('../src/services/stats.service');

async function testAttendanceRankingFull() {
  try {
    console.log('📊 测试出勤榜接口（完整数据）\n');

    // 获取所有数据
    const allData = await statsService.getRanking('attendance', {
      scope: 'all',
      page: 1,
      pageSize: 50
    });

    console.log(`总数: ${allData.total} 个球员\n`);

    // 按出勤率分组显示
    const by100 = allData.list.filter(item => item.attendanceRate === 100);
    const by0 = allData.list.filter(item => item.attendanceRate === 0);
    const byOther = allData.list.filter(item => item.attendanceRate > 0 && item.attendanceRate < 100);

    console.log(`出勤率 100%: ${by100.length} 人`);
    by100.forEach(item => {
      console.log(`  ✅ ${item.user.nickname} (${item.user.currentTeam?.name || '无队伍'}) - ${item.matchesPlayed}场`);
    });

    if (byOther.length > 0) {
      console.log(`\n出勤率 1%-99%: ${byOther.length} 人`);
      byOther.forEach(item => {
        console.log(`  ⚠️  ${item.user.nickname} (${item.user.currentTeam?.name || '无队伍'}) - ${item.attendanceRate}%`);
      });
    }

    console.log(`\n出勤率 0%: ${by0.length} 人`);
    by0.forEach(item => {
      console.log(`  ❌ ${item.user.nickname} (${item.user.currentTeam?.name || '无队伍'}) - ${item.matchesPlayed}场`);
    });

    console.log('\n✅ 出勤榜测试成功！');
    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testAttendanceRankingFull();
