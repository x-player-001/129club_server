const { Match } = require('../src/models');
const matchService = require('../src/services/match.service');
const logger = require('../src/utils/logger');

async function testAutoStatusUpdate() {
  try {
    const matchId = 'b320830d-eddb-450a-83cb-2b7cbf8bc193';

    // 1. 查看当前比赛状态
    let match = await Match.findByPk(matchId);
    logger.info('=== 测试自动状态更新 ===');
    logger.info(`当前比赛状态: ${match.status}`);
    logger.info(`比赛时间: ${match.matchDate}`);
    logger.info(`当前时间: ${new Date()}`);

    const now = new Date();
    const matchDate = new Date(match.matchDate);

    if (now > matchDate) {
      logger.info('✅ 当前时间已超过比赛开始时间，应该自动更新为 in_progress');
    } else {
      logger.info('⏰ 比赛尚未开始');
    }

    // 2. 调用比赛详情接口（会触发自动状态更新）
    logger.info('\n调用 getMatchDetail 接口...');
    const matchDetail = await matchService.getMatchDetail(matchId);

    logger.info(`更新后的状态: ${matchDetail.status}`);

    // 3. 再次查询数据库验证状态是否真的更新了
    match = await Match.findByPk(matchId);
    logger.info(`数据库中的状态: ${match.status}`);

    if (match.status === 'in_progress') {
      logger.info('\n🎉 自动状态更新成功！比赛已设置为进行中');
    } else {
      logger.info(`\n状态: ${match.status}`);
    }

  } catch (error) {
    logger.error('测试失败:', error);
  } finally {
    process.exit(0);
  }
}

testAutoStatusUpdate();
