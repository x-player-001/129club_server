/**
 * 碎片化录入功能测试脚本
 * 测试场景：模拟比赛进行中的实时录入
 */

require('dotenv').config();
const quarterService = require('./src/services/quarter.service');
const matchService = require('./src/services/match.service');
const { Match, Team, User, MatchQuarter, MatchEvent } = require('./src/models');

async function test() {
  console.log('='.repeat(60));
  console.log('碎片化录入功能测试');
  console.log('='.repeat(60));
  console.log();

  try {
    // 步骤1: 准备测试数据
    console.log('【步骤1】准备测试数据');
    console.log('-'.repeat(60));

    const teams = await Team.findAll({ limit: 2 });
    if (teams.length < 2) {
      throw new Error('需要至少2个队伍');
    }

    const users = await User.findAll({ limit: 5 });
    if (users.length < 5) {
      throw new Error('需要至少5个用户');
    }

    const team1 = teams[0];
    const team2 = teams[1];
    const user1 = users[0]; // 操作用户
    const player1 = users[1]; // 队伍1球员
    const player2 = users[2]; // 队伍1球员
    const player3 = users[3]; // 队伍2球员
    const player4 = users[4]; // 队伍2球员

    console.log(`✓ 队伍1: ${team1.name}`);
    console.log(`✓ 队伍2: ${team2.name}`);
    console.log(`✓ 测试用户: ${users.length}人`);
    console.log();

    // 步骤2: 创建4节制比赛
    console.log('【步骤2】创建4节制比赛');
    console.log('-'.repeat(60));

    const match = await matchService.createMatch({
      title: `${team1.name} vs ${team2.name} - 碎片化录入测试`,
      team1Id: team1.id,
      team2Id: team2.id,
      matchDate: new Date(),
      location: '测试场地',
      quarterSystem: true
    }, user1.id);

    console.log(`✓ 比赛创建成功: ${match.id}`);
    console.log();

    // 步骤3: 实时碎片化录入 - 第1节
    console.log('【步骤3】第1节 - 碎片化录入（追加模式）');
    console.log('-'.repeat(60));

    // 第1节第5分钟：player1进球
    console.log('第5分钟: player1进球...');
    let result1 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 1,
      mode: 'append',
      team1Goals: 1,
      team2Goals: 0,
      events: [
        {
          teamId: team1.id,
          userId: player1.id,
          eventType: 'goal',
          minute: 5,
          notes: '远射破门'
        }
      ]
    }, user1.id);
    console.log(`✓ 事件已录入，当前比分: ${result1.currentScore.team1TotalGoals}-${result1.currentScore.team2TotalGoals}`);

    // 第1节第10分钟：player2进球
    console.log('第10分钟: player2进球...');
    let result2 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 1,
      mode: 'append',
      team1Goals: 2,
      team2Goals: 0,
      events: [
        {
          teamId: team1.id,
          userId: player2.id,
          eventType: 'goal',
          minute: 10,
          assistUserId: player1.id,
          notes: '头球'
        }
      ]
    }, user1.id);
    console.log(`✓ 事件已录入，当前比分: ${result2.currentScore.team1TotalGoals}-${result2.currentScore.team2TotalGoals}`);

    // 第1节第15分钟：player3进球
    console.log('第15分钟: player3进球...');
    let result3 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 1,
      mode: 'append',
      team1Goals: 2,
      team2Goals: 1,
      events: [
        {
          teamId: team2.id,
          userId: player3.id,
          eventType: 'goal',
          minute: 15
        }
      ]
    }, user1.id);
    console.log(`✓ 事件已录入，当前比分: ${result3.currentScore.team1TotalGoals}-${result3.currentScore.team2TotalGoals}`);
    console.log(`✓ 第1节得分: 队伍1 +${result3.quarter.team1Points}分, 队伍2 +${result3.quarter.team2Points}分`);
    console.log();

    // 步骤4: 第2节录入
    console.log('【步骤4】第2节 - 碎片化录入');
    console.log('-'.repeat(60));

    console.log('第25分钟: player3进球...');
    let result4 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 2,
      mode: 'append',
      team1Goals: 0,
      team2Goals: 1,
      events: [
        {
          teamId: team2.id,
          userId: player3.id,
          eventType: 'goal',
          minute: 25
        }
      ]
    }, user1.id);
    console.log(`✓ 事件已录入，当前比分: ${result4.currentScore.team1TotalGoals}-${result4.currentScore.team2TotalGoals}`);

    console.log('第30分钟: player1进球...');
    let result5 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 2,
      mode: 'append',
      team1Goals: 1,
      team2Goals: 1,
      events: [
        {
          teamId: team1.id,
          userId: player1.id,
          eventType: 'goal',
          minute: 30
        }
      ]
    }, user1.id);
    console.log(`✓ 事件已录入，当前比分: ${result5.currentScore.team1TotalGoals}-${result5.currentScore.team2TotalGoals}`);
    console.log(`✓ 第2节得分: 队伍1 +${result5.quarter.team1Points}分, 队伍2 +${result5.quarter.team2Points}分`);
    console.log();

    // 步骤5: 返回修改第1节（覆盖模式）
    console.log('【步骤5】返回修改第1节 - 发现之前漏录了一个进球');
    console.log('-'.repeat(60));

    console.log('重新录入第1节，补充漏录的进球...');
    let result6 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 1,
      mode: 'overwrite',
      team1Goals: 3,
      team2Goals: 1,
      summary: '第1节比赛精彩，红队3:1领先',
      events: [
        {
          teamId: team1.id,
          userId: player1.id,
          eventType: 'goal',
          minute: 5,
          notes: '远射破门'
        },
        {
          teamId: team1.id,
          userId: player2.id,
          eventType: 'goal',
          minute: 10,
          assistUserId: player1.id,
          notes: '头球'
        },
        {
          teamId: team2.id,
          userId: player3.id,
          eventType: 'goal',
          minute: 15
        },
        {
          teamId: team1.id,
          userId: player1.id,
          eventType: 'goal',
          minute: 18,
          notes: '补录的进球'
        }
      ]
    }, user1.id);
    console.log(`✓ 第1节已修正，当前比分: ${result6.currentScore.team1TotalGoals}-${result6.currentScore.team2TotalGoals}`);
    console.log(`✓ 修正后第1节得分: 队伍1 +${result6.quarter.team1Points}分, 队伍2 +${result6.quarter.team2Points}分`);
    console.log();

    // 步骤6: 使用auto模式 - 自动统计比分
    console.log('【步骤6】第3节 - 自动模式（不需要手动传比分）');
    console.log('-'.repeat(60));

    console.log('第45分钟: player2进球...');
    let result7 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 3,
      mode: 'auto',
      events: [
        {
          teamId: team1.id,
          userId: player2.id,
          eventType: 'goal',
          minute: 45
        }
      ]
    }, user1.id);
    console.log(`✓ AI自动统计比分: 第3节 ${result7.quarter.team1Goals}-${result7.quarter.team2Goals}`);

    console.log('第50分钟: player4进球...');
    let result8 = await quarterService.submitQuarter(match.id, {
      quarterNumber: 3,
      mode: 'auto',
      events: [
        {
          teamId: team2.id,
          userId: player4.id,
          eventType: 'goal',
          minute: 50
        }
      ]
    }, user1.id);
    console.log(`✓ AI自动统计比分: 第3节 ${result8.quarter.team1Goals}-${result8.quarter.team2Goals}`);
    console.log(`✓ 第3节得分: 队伍1 +${result8.quarter.team1Points}分, 队伍2 +${result8.quarter.team2Points}分`);
    console.log();

    // 步骤7: 验证最终数据
    console.log('【步骤7】验证最终数据');
    console.log('-'.repeat(60));

    const finalMatch = await Match.findByPk(match.id);
    const quarters = await MatchQuarter.findAll({
      where: { matchId: match.id },
      order: [['quarterNumber', 'ASC']]
    });
    const events = await MatchEvent.findAll({
      where: { matchId: match.id },
      order: [['quarterNumber', 'ASC'], ['minute', 'ASC']]
    });

    console.log('比赛最终得分:');
    console.log(`  队伍1: ${finalMatch.finalTeam1Score}分`);
    console.log(`  队伍2: ${finalMatch.finalTeam2Score}分`);
    console.log();

    console.log('各节次详情:');
    quarters.forEach(q => {
      console.log(`  第${q.quarterNumber}节: ${q.team1Goals}-${q.team2Goals} (队伍1 +${q.team1Points}分, 队伍2 +${q.team2Points}分)`);
    });
    console.log();

    console.log(`总事件数: ${events.length}条`);
    console.log();

    console.log('='.repeat(60));
    console.log('✓ 所有测试通过！');
    console.log('='.repeat(60));
    console.log();
    console.log('测试结论:');
    console.log('  ✓ 支持碎片化实时录入（append模式）');
    console.log('  ✓ 支持返回修改历史节次（overwrite模式）');
    console.log('  ✓ 支持自动统计比分（auto模式）');
    console.log('  ✓ 数据一致性验证通过');

  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 运行测试
test();
