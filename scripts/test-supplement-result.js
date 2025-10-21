// 清除require缓存，确保加载最新的模型定义
delete require.cache[require.resolve('../src/models')];
delete require.cache[require.resolve('../src/models/MatchResult')];

const { Match, MatchQuarter, MatchResult, User } = require('../src/models');

async function testSupplementResult() {
  const matchId = 'b320830d-eddb-450a-83cb-2b7cbf8bc193';

  console.log('=== 测试补充比赛结果功能 ===\n');

  // 1. 检查比赛当前状态
  const match = await Match.findByPk(matchId);
  if (!match) {
    console.log('❌ 比赛不存在');
    return;
  }

  console.log('【比赛当前状态】');
  console.log(`- 比赛标题: ${match.title}`);
  console.log(`- 4节制: ${match.quarterSystem}`);
  console.log(`- 比赛状态: ${match.status}`);
  console.log('');

  // 2. 检查节次数据
  const quarters = await MatchQuarter.findAll({
    where: { matchId },
    order: [['quarterNumber', 'ASC']]
  });

  console.log('【节次数据】');
  quarters.forEach(q => {
    console.log(`第${q.quarterNumber}节: 状态=${q.status}, 比分=${q.team1Score}-${q.team2Score}`);
  });
  console.log('');

  // 3. 检查现有 match_results 数据
  const existingResult = await MatchResult.findOne({ where: { matchId } });
  console.log('【现有结果记录】');
  if (existingResult) {
    console.log(`- MVP: ${existingResult.mvpUserId || '未设置'}`);
    console.log(`- 照片: ${existingResult.photos || '未设置'}`);
    console.log(`- 总结: ${existingResult.summary || '未设置'}`);
  } else {
    console.log('- 无结果记录');
  }
  console.log('');

  // 4. 准备测试数据（支持多个MVP）
  const testData = {
    mvpUserIds: [
      '33efcc0e-90d0-4224-98f0-5d4c01b69319',
      '5bc76f4f-a2a3-450a-9bee-6d0af2e9333e'
    ], // 多个MVP用户ID
    photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    summary: '这是一场精彩的比赛，双方势均力敌，最终X队以微弱优势获胜。'
  };

  console.log('【测试数据】');
  console.log(`- MVP 数量: ${testData.mvpUserIds.length}`);
  console.log(`- MVP IDs: ${testData.mvpUserIds.join(', ')}`);
  console.log(`- 照片数量: ${testData.photos.length}`);
  console.log(`- 总结: ${testData.summary}`);
  console.log('');

  // 5. 调用服务函数
  const quarterService = require('../src/services/quarter.service');

  try {
    console.log('正在调用 supplementQuarterResult...\n');

    const result = await quarterService.supplementQuarterResult(
      matchId,
      testData,
      '33efcc0e-90d0-4224-98f0-5d4c01b69319' // 真实用户 ID
    );

    console.log('✅ 补充结果成功！\n');

    console.log('【返回结果】');
    console.log(`- 比赛状态: ${result.match.status}`);
    console.log(`- 最终比分: ${result.score.team1FinalScore} - ${result.score.team2FinalScore}`);
    console.log(`- 总进球数: ${result.score.team1TotalGoals} - ${result.score.team2TotalGoals}`);
    console.log(`- MVP 数量: ${result.result.mvpUserIds ? result.result.mvpUserIds.length : 0}`);
    console.log(`- MVP IDs: ${result.result.mvpUserIds ? result.result.mvpUserIds.join(', ') : '未设置'}`);
    console.log(`- 照片数: ${result.result.photos ? result.result.photos.length : 0}`);
    console.log(`- 总结: ${result.result.summary || '未设置'}`);
    console.log('');

    // 6. 验证数据库更新
    const updatedMatch = await Match.findByPk(matchId);
    const updatedResult = await MatchResult.findOne({ where: { matchId } });

    console.log('【数据库验证】');
    console.log(`✓ 比赛状态已更新: ${updatedMatch.status}`);
    console.log(`✓ 结果记录已${existingResult ? '更新' : '创建'}`);
    console.log(`✓ MVP 已设置: ${updatedResult.mvpUserIds && updatedResult.mvpUserIds.length > 0 ? '是' : '否'}`);
    console.log(`✓ MVP 数量: ${updatedResult.mvpUserIds ? updatedResult.mvpUserIds.length : 0}`);
    console.log(`✓ 照片已保存: ${updatedResult.photos ? '是' : '否'}`);
    console.log(`✓ 总结已保存: ${updatedResult.summary ? '是' : '否'}`);

  } catch (err) {
    console.log('❌ 测试失败:');
    console.log(err.message);
  }
}

testSupplementResult()
  .then(() => {
    console.log('\n=== 测试完成 ===');
    process.exit(0);
  })
  .catch(err => {
    console.error('测试执行错误:', err);
    process.exit(1);
  });
