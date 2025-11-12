const { PlayerStat, User } = require('../src/models');

async function checkAbsentPlayerStats() {
  try {
    console.log('📊 检查未到场球员的统计记录\n');

    // 未到场的3个球员
    const absentPlayers = ['小旋风', '许辉', '赵明'];

    for (const nickname of absentPlayers) {
      const user = await User.findOne({
        where: { nickname },
        attributes: ['id', 'nickname', 'currentTeamId']
      });

      if (!user) {
        console.log(`❌ 未找到球员: ${nickname}\n`);
        continue;
      }

      const playerStat = await PlayerStat.findOne({
        where: { userId: user.id }
      });

      console.log(`${nickname} (队伍ID: ${user.currentTeamId}):`);
      if (playerStat) {
        console.log(`  有PlayerStat记录`);
        console.log(`  参赛场次: ${playerStat.matchesPlayed}`);
        console.log(`  出勤率: ${playerStat.attendanceRate}%`);
        console.log(`  进球: ${playerStat.goals}, 助攻: ${playerStat.assists}`);
      } else {
        console.log(`  ❌ 没有PlayerStat记录`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkAbsentPlayerStats();
