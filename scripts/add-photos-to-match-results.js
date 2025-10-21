const sequelize = require('../src/config/database');

async function addPhotosColumn() {
  try {
    console.log('正在为 match_results 表添加 photos 字段...\n');

    // 添加 photos 列 (JSON类型用于存储照片URL数组)
    await sequelize.query(`
      ALTER TABLE match_results
      ADD COLUMN photos JSON NULL COMMENT '比赛照片URL数组'
      AFTER mvp_user_id
    `);

    console.log('✅ photos 字段已添加到 match_results 表');

  } catch (error) {
    console.error('❌ 添加字段失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addPhotosColumn();
