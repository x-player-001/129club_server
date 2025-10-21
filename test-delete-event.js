const quarterService = require('./src/services/quarter.service');

async function testDeleteEvent() {
  try {
    const matchId = '85d21bc2-3ce7-4a18-bdcb-da7031f108ab';
    const userId = '5bc76f4f-a2a3-450a-9bee-6d0af2e9333e';

    // 模拟前端请求参数
    const data = {
      quarterNumber: 1,
      mode: 'auto',
      team1Goals: 4,
      team2Goals: 0,
      summary: '',
      deleteEventIds: ['88d08345-4c57-486e-92cc-f7127c644fd9'],
      events: [] // 不添加新事件，只删除
    };

    console.log('测试参数:', JSON.stringify(data, null, 2));

    const result = await quarterService.submitQuarter(matchId, data, userId);

    console.log('\n删除结果:');
    console.log('- deletedEventCount:', result.deletedEventCount);
    console.log('- createdEvents:', result.events.length);
    console.log('- mode:', result.mode);
    console.log('\n完整返回:', JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDeleteEvent();
