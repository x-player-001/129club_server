const { Registration } = require('../src/models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../src/utils/logger');

async function addRegistrationData() {
  try {
    const matchId = 'b320830d-eddb-450a-83cb-2b7cbf8bc193';
    const team1Id = '6996d579-431f-4281-acf6-4c8bd0f76a20'; // 嘉陵摩托
    const team2Id = 'dfa42511-c9e3-4a50-9d67-e7ab390bddbd'; // 长江黄河

    // 嘉陵摩托队伍的报名人员
    const team1Registrations = [
      { userId: 'e05e1682-bff2-4fd6-80d1-696a4e2f8297', nickname: '球员5' },
      { userId: '81c60644-3b34-481d-93e1-eaab47e8dbfb', nickname: '球员10' },
      { userId: 'b7a0b93e-2fa9-437f-ad2a-20ef1ab92588', nickname: '球员1' },
      { userId: '97e53808-7eab-4676-9c2b-630ecd0d9c74', nickname: '球员7' },
      { userId: '4b715272-e350-47bf-b436-b0fe8ecfb386', nickname: '红队队长' },
      { userId: 'd1956de0-2507-4fd4-a4bd-6276592577cc', nickname: '球员9' }
    ];

    // 长江黄河队伍的报名人员
    const team2Registrations = [
      { userId: '7be7117e-1c94-46fa-be32-310aae81326e', nickname: '球员3' },
      { userId: '51fb6e7a-13c7-44e3-8b0c-31500731d028', nickname: '球员2' },
      { userId: 'dfc3e2e0-fc79-4ebe-86d3-00dcf71486d3', nickname: '球员8' },
      { userId: '95ff57fb-7b0c-44aa-8c16-7d8c1ccc83f6', nickname: '用户test_c' },
      { userId: '61646a36-269e-4fab-9bff-0d5028617d2b', nickname: '球员4' },
      { userId: 'b78ba5bf-f071-4e9c-ac1a-ac97af3e7c94', nickname: '球员6' }
    ];

    logger.info('开始插入报名数据...');

    // 插入嘉陵摩托队伍的报名
    for (const player of team1Registrations) {
      await Registration.create({
        id: uuidv4(),
        matchId,
        userId: player.userId,
        teamId: team1Id,
        status: 'confirmed',
        registeredAt: new Date(),
        notes: null
      });
      logger.info(`✅ 嘉陵摩托 - ${player.nickname} 报名成功`);
    }

    // 插入长江黄河队伍的报名
    for (const player of team2Registrations) {
      await Registration.create({
        id: uuidv4(),
        matchId,
        userId: player.userId,
        teamId: team2Id,
        status: 'confirmed',
        registeredAt: new Date(),
        notes: null
      });
      logger.info(`✅ 长江黄河 - ${player.nickname} 报名成功`);
    }

    logger.info(`\n🎉 报名数据插入完成！`);
    logger.info(`   嘉陵摩托：${team1Registrations.length} 人`);
    logger.info(`   长江黄河：${team2Registrations.length} 人`);
    logger.info(`   总计：${team1Registrations.length + team2Registrations.length} 人`);

  } catch (error) {
    logger.error('插入报名数据失败:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addRegistrationData();
