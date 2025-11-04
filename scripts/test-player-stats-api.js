const statsService = require('../src/services/stats.service');
const { User } = require('../src/models');

async function testPlayerStatsAPI() {
  try {
    console.log('📊 测试个人数据详情接口\n');

    // 获取一个有数据的用户
    const user = await User.findOne({
      attributes: ['id', 'nickname']
    });

    if (!user) {
      console.log('❌ 没有找到用户');
      process.exit(1);
    }

    console.log(`测试用户: ${user.nickname} (${user.id})\n`);

    // 调用接口
    const result = await statsService.getPlayerStats(user.id, {});

    console.log('='.repeat(60));
    console.log('📋 个人信息');
    console.log('='.repeat(60));
    console.log(`姓名: ${result.user.nickname} (${result.user.realName || '未设置'})`);
    console.log(`球衣号码: ${result.user.jerseyNumber || '未设置'}`);
    console.log(`位置: ${JSON.stringify(result.user.position)}`);
    console.log(`左脚技能: ${result.user.leftFootSkill}/5`);
    console.log(`右脚技能: ${result.user.rightFootSkill}/5`);
    console.log(`当前队伍: ${result.user.currentTeam?.name || '无队伍'}`);

    console.log('\n' + '='.repeat(60));
    console.log('📊 统计数据');
    console.log('='.repeat(60));
    console.log(`参赛场次: ${result.stats.totalMatches}`);
    console.log(`进球数: ${result.stats.totalGoals}`);
    console.log(`助攻数: ${result.stats.totalAssists}`);
    console.log(`MVP次数: ${result.stats.totalMVP}`);
    console.log(`胜/平/负: ${result.stats.totalWins}/${result.stats.totalDraws}/${result.stats.totalLosses}`);
    console.log(`胜率: ${result.stats.winRate}%`);
    console.log(`出勤率: ${result.stats.attendance}%`);
    console.log(`黄牌/红牌: ${result.stats.yellowCards}/${result.stats.redCards}`);

    console.log('\n' + '='.repeat(60));
    console.log('🏆 排名');
    console.log('='.repeat(60));
    console.log(`射手榜: ${result.rankings.goals || '未上榜'}`);
    console.log(`助攻榜: ${result.rankings.assists || '未上榜'}`);
    console.log(`MVP榜: ${result.rankings.mvp || '未上榜'}`);
    console.log(`出勤榜: ${result.rankings.attendance}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎖️  成就');
    console.log('='.repeat(60));
    if (result.achievements.length > 0) {
      result.achievements.forEach(ach => {
        console.log(`✅ ${ach.name} (${ach.code})`);
        if (ach.description) {
          console.log(`   ${ach.description}`);
        }
      });
    } else {
      console.log('暂无成就');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 接口测试成功！');
    console.log('='.repeat(60));

    // 输出完整JSON
    console.log('\n完整返回数据:');
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testPlayerStatsAPI();
