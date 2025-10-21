const matchService = require('../src/services/match.service');
const { Registration } = require('../src/models');

async function testSetParticipants() {
  try {
    const matchId = 'b320830d-eddb-450a-83cb-2b7cbf8bc193';

    console.log('=== 测试设置参赛球员 ===\n');

    // 1. 获取该比赛的所有报名球员
    const registrations = await Registration.findAll({
      where: { matchId },
      attributes: ['userId', 'teamId']
    });

    const team1Id = '6996d579-431f-4281-acf6-4c8bd0f76a20'; // 嘉陵摩托
    const team2Id = 'dfa42511-c9e3-4a50-9d67-e7ab390bddbd'; // 长江黄河

    // 按队伍分组
    const team1Users = registrations
      .filter(r => r.teamId === team1Id)
      .map(r => r.userId);

    const team2Users = registrations
      .filter(r => r.teamId === team2Id)
      .map(r => r.userId);

    console.log(`嘉陵摩托报名人数: ${team1Users.length}`);
    console.log(`长江黄河报名人数: ${team2Users.length}`);

    // 2. 设置参赛球员（选择前5名）
    const data = {
      team1: team1Users.slice(0, 5),
      team2: team2Users.slice(0, 5)
    };

    console.log(`\n设置嘉陵摩托参赛球员: ${data.team1.length} 人`);
    console.log(`设置长江黄河参赛球员: ${data.team2.length} 人`);

    const result = await matchService.setMatchParticipants(matchId, data);

    console.log('\n✅ 设置成功！');
    console.log(`- 队伍1参赛人数: ${result.team1Count}`);
    console.log(`- 队伍2参赛人数: ${result.team2Count}`);
    console.log(`- 总参赛人数: ${result.totalCount}`);

    // 3. 验证：获取参赛球员列表
    const participants = await matchService.getMatchParticipants(matchId);

    console.log('\n=== 验证参赛球员 ===');
    console.log(`队伍1实际到场: ${participants.team1Count} 人`);
    console.log(`队伍2实际到场: ${participants.team2Count} 人`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testSetParticipants();
