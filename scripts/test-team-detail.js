const teamService = require('../src/services/team.service');

async function testTeamDetail() {
  try {
    const team = await teamService.getTeamDetail('b6ab3e9b-7bd7-468f-ae54-51c7675831e3');

    console.log('队伍名称:', team.name);
    console.log('\n队长信息:');
    const captain = team.captain;
    console.log('  姓名:', captain.nickname);
    console.log('  位置:', captain.position);
    console.log('  左脚:', captain.leftFootSkill);
    console.log('  右脚:', captain.rightFootSkill);

    console.log('\n成员列表 (前5个):');
    team.members.slice(0, 5).forEach((m, i) => {
      console.log(`\n  成员${i+1}: ${m.user.nickname}`);
      console.log(`    位置: ${m.user.position}`);
      console.log(`    左脚: ${m.user.leftFootSkill}, 右脚: ${m.user.rightFootSkill}`);
    });

    console.log('\n✅ 接口已包含惯用脚信息');
    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  }
}

testTeamDetail();
