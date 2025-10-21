const sequelize = require('../src/config/database');

async function addStatusColumn() {
  try {
    console.log('正在添加 status 字段到 match_quarters 表...');

    await sequelize.query(`
      ALTER TABLE match_quarters
      ADD COLUMN status ENUM('in_progress', 'completed')
      NOT NULL DEFAULT 'in_progress'
      COMMENT '节次状态：in_progress=进行中, completed=已完成'
      AFTER summary
    `);

    console.log('✓ status 字段添加成功！');

    // 验证字段是否添加成功
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM match_quarters WHERE Field = 'status'
    `);

    if (results.length > 0) {
      console.log('✓ 验证成功，字段信息：', results[0]);
    }

    process.exit(0);
  } catch (error) {
    if (error.message.includes("Duplicate column name")) {
      console.log('⚠ status 字段已存在，跳过添加');
      process.exit(0);
    } else {
      console.error('✗ 添加字段失败：', error.message);
      process.exit(1);
    }
  }
}

addStatusColumn();
