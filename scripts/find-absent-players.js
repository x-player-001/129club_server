const { Registration, MatchParticipant, User, Match } = require('../src/models');

async function findAbsentPlayers() {
  try {
    console.log('🔍 查找报名了但未到场的球员\n');

    // 获取所有报名记录
    const registrations = await Registration.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['nickname']
        },
        {
          model: Match,
          as: 'match',
          attributes: ['matchDate', 'status']
        }
      ]
    });

    console.log(`总报名记录: ${registrations.length} 条\n`);

    let absentCount = 0;

    for (const reg of registrations) {
      // 检查是否有到场记录
      const participant = await MatchParticipant.findOne({
        where: {
          matchId: reg.matchId,
          userId: reg.userId
        }
      });

      if (!participant) {
        console.log(`❌ ${reg.user?.nickname || '未知'}`);
        console.log(`   比赛时间: ${reg.match?.matchDate}`);
        console.log(`   比赛状态: ${reg.match?.status}`);
        console.log(`   报名状态: ${reg.status}`);
        console.log('');
        absentCount++;
      } else {
        console.log(`✅ ${reg.user?.nickname || '未知'} - 已到场`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`总报名: ${registrations.length} 人次`);
    console.log(`已到场: ${registrations.length - absentCount} 人次`);
    console.log(`未到场: ${absentCount} 人次`);
    console.log(`整体出勤率: ${((registrations.length - absentCount) / registrations.length * 100).toFixed(2)}%`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

findAbsentPlayers();
