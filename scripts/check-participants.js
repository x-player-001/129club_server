const { MatchParticipant, User, Team, Registration, Lineup } = require('../src/models');

async function checkParticipants() {
  try {
    const matchId = 'b320830d-eddb-450a-83cb-2b7cbf8bc193';

    console.log('=== 检查 match_participants 表数据 ===\n');

    // 查询该比赛的所有参赛球员
    const participants = await MatchParticipant.findAll({
      where: { matchId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] }
      ]
    });

    console.log('找到的参赛球员记录:', participants.length, '条');

    if (participants.length === 0) {
      console.log('\n❌ match_participants 表中没有这场比赛的数据！');
      console.log('\n可能的原因：');
      console.log('1. 比赛还没有设置阵容/参赛球员');
      console.log('2. 数据在其他表中（如 registrations 或 lineups）');

      // 检查 registrations 表
      const registrations = await Registration.count({ where: { matchId } });
      console.log('\nregistrations 表中的记录:', registrations, '条');

      // 检查 lineups 表
      const lineups = await Lineup.count({ where: { matchId } });
      console.log('lineups 表中的记录:', lineups, '条');

      // 显示 registrations 详情
      if (registrations > 0) {
        console.log('\n=== registrations 表详情 ===');
        const regList = await Registration.findAll({
          where: { matchId },
          include: [
            { model: User, as: 'user', attributes: ['id', 'nickname'] },
            { model: Team, as: 'team', attributes: ['id', 'name'] }
          ]
        });
        regList.forEach((r, i) => {
          console.log(`${i+1}. ${r.user.nickname} - 队伍: ${r.team.name} - 状态: ${r.status}`);
        });
      }
    } else {
      participants.forEach((p, i) => {
        console.log(`${i+1}. 球员: ${p.user?.nickname || 'N/A'}, 队伍: ${p.team?.name || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

checkParticipants();
