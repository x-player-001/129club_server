const sequelize = require('../src/config/database');

async function modifyMvpField() {
  try {
    console.log('正在修改 match_results 表的 MVP 字段以支持多个MVP...\n');

    // 1. 先查看现有数据
    const [results] = await sequelize.query(`
      SELECT id, mvp_user_id FROM match_results WHERE mvp_user_id IS NOT NULL
    `);

    console.log(`找到 ${results.length} 条记录有 MVP 数据`);

    // 2. 添加新的 JSON 字段
    await sequelize.query(`
      ALTER TABLE match_results
      ADD COLUMN mvp_user_ids JSON NULL COMMENT 'MVP用户ID数组'
      AFTER mvp_user_id
    `);

    console.log('✅ 已添加新字段 mvp_user_ids (JSON)');

    // 3. 迁移现有数据：将单个 mvp_user_id 转换为数组格式
    if (results.length > 0) {
      console.log('\n正在迁移现有 MVP 数据...');

      for (const row of results) {
        await sequelize.query(`
          UPDATE match_results
          SET mvp_user_ids = JSON_ARRAY(?)
          WHERE id = ?
        `, {
          replacements: [row.mvp_user_id, row.id]
        });
      }

      console.log(`✅ 已迁移 ${results.length} 条记录`);
    }

    // 4. 删除外键约束
    console.log('\n正在删除外键约束...');
    await sequelize.query(`
      ALTER TABLE match_results
      DROP FOREIGN KEY match_results_ibfk_3
    `);
    console.log('✅ 已删除外键约束');

    // 5. 删除旧字段
    await sequelize.query(`
      ALTER TABLE match_results
      DROP COLUMN mvp_user_id
    `);

    console.log('✅ 已删除旧字段 mvp_user_id');

    console.log('\n✅ MVP 字段修改完成！现在支持多个 MVP');

  } catch (error) {
    console.error('❌ 修改失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

modifyMvpField();
