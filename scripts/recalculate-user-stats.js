const { recalculatePlayerStats } = require('../src/services/quarter.service');

const userId = '942b0614-06e4-4e35-acd8-52f806a9a5c7';

async function run() {
  try {
    console.log(`重新计算用户 ${userId} 的统计数据...`);
    await recalculatePlayerStats(userId);
    console.log('✅ 统计数据计算完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 计算失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

run();
