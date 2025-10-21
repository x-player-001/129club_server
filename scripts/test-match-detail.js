const matchService = require('../src/services/match.service');

async function testMatchDetail() {
  const matchId = 'b320830d-eddb-450a-83cb-2b7cbf8bc193';

  console.log('=== 测试 getMatchDetail 接口返回内容 ===\n');

  try {
    const result = await matchService.getMatchDetail(matchId);

    console.log('【返回字段列表】');
    console.log(Object.keys(result.dataValues || result));
    console.log('');

    console.log('【是否包含 participants】');
    console.log('result.participants:', result.participants !== undefined ? '存在' : '不存在');
    console.log('');

    console.log('【完整返回数据】');
    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error('❌ 错误:', err.message);
  } finally {
    process.exit(0);
  }
}

testMatchDetail();
