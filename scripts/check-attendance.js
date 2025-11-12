const { PlayerStat, User, Team } = require('../src/models');

async function check() {
  const stats = await PlayerStat.findAll({
    include: [{
      model: User,
      as: 'user',
      attributes: ['nickname', 'currentTeamId'],
      include: [{
        model: Team,
        as: 'currentTeam',
        attributes: ['name']
      }]
    }],
    limit: 5,
    order: [['matchesPlayed', 'DESC']]
  });

  console.log('📊 当前球员统计数据:\n');
  stats.forEach(s => {
    const teamName = s.user.currentTeam?.name || '无队伍';
    console.log(`${s.user.nickname} (${teamName}):`);
    console.log(`  参赛场次: ${s.matchesPlayed}`);
    console.log(`  出勤率: ${s.attendanceRate}`);
    console.log(`  进球: ${s.goals}, 助攻: ${s.assists}`);
    console.log('');
  });

  process.exit(0);
}

check();
