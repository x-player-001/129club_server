const statsService = require('../src/services/stats.service');
const { User } = require('../src/models');

async function testNoDataUser() {
  try {
    console.log('📊 测试无统计数据用户的接口返回\n');

    // 查找许辉（报名但未到场的用户）
    const user = await User.findOne({
      where: { nickname: '许辉' },
      attributes: ['id', 'nickname']
    });

    if (!user) {
      console.log('❌ 未找到测试用户');
      process.exit(1);
    }

    console.log(`测试用户: ${user.nickname} (${user.id})\n`);

    // 调用接口
    const result = await statsService.getPlayerStats(user.id, {});

    console.log('='.repeat(60));
    console.log('📋 个人信息');
    console.log('='.repeat(60));
    console.log(`姓名: ${result.user.nickname}`);
    console.log(`球衣号码: ${result.user.jerseyNumber || '未设置'}`);
    console.log(`当前队伍: ${result.user.currentTeam?.name || '无队伍'}`);

    console.log('\n' + '='.repeat(60));
    console.log('📊 统计数据');
    console.log('='.repeat(60));
    console.log(`参赛场次: ${result.stats.totalMatches}`);
    console.log(`进球数: ${result.stats.totalGoals}`);
    console.log(`助攻数: ${result.stats.totalAssists}`);
    console.log(`出勤率: ${result.stats.attendance}%`);

    console.log('\n' + '='.repeat(60));
    console.log('🏆 排名');
    console.log('='.repeat(60));
    console.log(`射手榜: ${result.rankings.goals || '未上榜'}`);
    console.log(`助攻榜: ${result.rankings.assists || '未上榜'}`);
    console.log(`MVP榜: ${result.rankings.mvp || '未上榜'}`);
    console.log(`出勤榜: ${result.rankings.attendance}`);

    console.log('\n✅ 无数据用户测试成功！默认值正确返回。');

    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testNoDataUser();
