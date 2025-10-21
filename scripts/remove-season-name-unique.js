const sequelize = require('../src/config/database');

async function removeSeasonNameUnique() {
  try {
    console.log('开始移除seasons表name字段的唯一约束...');

    // 检查索引是否存在
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM seasons WHERE Key_name = 'name'
    `);

    if (indexes.length > 0) {
      console.log('找到唯一索引，准备删除...');

      // 删除唯一索引
      await sequelize.query(`
        ALTER TABLE seasons DROP INDEX name
      `);

      console.log('✓ 成功删除name字段的唯一索引');
    } else {
      console.log('未找到name字段的唯一索引，可能已经删除');
    }

    console.log('✓ 迁移完成！赛季名称现在可以重复了');
    process.exit(0);
  } catch (error) {
    console.error('× 迁移失败:', error.message);
    process.exit(1);
  }
}

removeSeasonNameUnique();
