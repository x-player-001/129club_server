const { Team, Season, User } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function insertTeams() {
  try {
    console.log('开始插入队伍数据...');

    // 获取当前活跃的赛季
    const currentSeason = await Season.findOne({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    if (!currentSeason) {
      console.error('❌ 没有找到活跃的赛季');
      process.exit(1);
    }

    console.log(`✅ 找到当前赛季: ${currentSeason.name} (ID: ${currentSeason.id})`);

    // 获取队长用户 (李强 - captain角色)
    const captain = await User.findOne({
      where: { role: 'captain' },
      attributes: ['id', 'realName']
    });

    if (!captain) {
      console.log('⚠️  没有找到队长角色的用户，将创建没有队长的队伍');
    } else {
      console.log(`✅ 找到队长: ${captain.realName} (ID: ${captain.id})`);
    }

    // 插入两个队伍
    const teams = [
      {
        id: uuidv4(),
        name: '嘉陵摩托',
        logo: null,
        captainId: captain ? captain.id : null,
        color: '#FF4757',
        season: currentSeason.name,
        status: 'active',
        createdBy: captain ? captain.id : null
      },
      {
        id: uuidv4(),
        name: '长江黄河',
        logo: null,
        captainId: null,
        color: '#1E90FF',
        season: currentSeason.name,
        status: 'active',
        createdBy: captain ? captain.id : null
      }
    ];

    await Team.bulkCreate(teams);

    console.log(`\n✅ 成功插入 ${teams.length} 个队伍:`);
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name} (颜色: ${team.color}, 赛季: ${team.season})`);
    });

    console.log('\n✅ 队伍数据插入完成！');
    process.exit(0);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

insertTeams();
