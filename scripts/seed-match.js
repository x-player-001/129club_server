require('dotenv').config();
const { Match, Team } = require('../src/models');

async function seedMatch() {
  try {
    console.log('🌱 创建测试比赛数据...');

    // 获取两个队伍
    const teams = await Team.findAll({ limit: 2 });

    if (teams.length < 2) {
      console.error('❌ 需要至少2个队伍，请先运行 npm run seed');
      process.exit(1);
    }

    const [team1, team2] = teams;

    // 创建一场即将开始的比赛（可以报名）
    const upcomingMatch = await Match.create({
      title: `${team1.name} vs ${team2.name} - 周末友谊赛`,
      team1Id: team1.id,
      team2Id: team2.id,
      matchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
      location: '129足球场',
      status: 'registration',
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5天后截止
      maxPlayersPerTeam: 11,
      createdBy: team1.captainId
    });

    console.log('✅ 创建即将开始的比赛:', upcomingMatch.title);

    // 创建一场历史比赛
    const pastMatch = await Match.create({
      title: `${team1.name} vs ${team2.name} - 上周对抗赛`,
      team1Id: team1.id,
      team2Id: team2.id,
      matchDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
      location: '129足球场',
      status: 'upcoming',
      maxPlayersPerTeam: 11,
      createdBy: team1.captainId
    });

    console.log('✅ 创建历史比赛:', pastMatch.title);

    console.log('\n✅ 测试比赛数据创建完成！');
    console.log(`\n📊 比赛信息：`);
    console.log(`   即将开始的比赛ID: ${upcomingMatch.id}`);
    console.log(`   历史比赛ID: ${pastMatch.id}`);

  } catch (error) {
    console.error('❌ 创建失败：', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedMatch();
