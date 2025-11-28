const { recalculatePlayerStats } = require('../src/services/quarter.service');

async function syncUserStats() {
  const userId = '942b0614-06e4-4e35-acd8-52f806a9a5c7';

  console.log(`开始同步用户 ${userId} 的统计数据...`);

  try {
    await recalculatePlayerStats(userId);
    console.log('✅ 数据同步完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

syncUserStats();
