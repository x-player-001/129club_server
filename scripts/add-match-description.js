const sequelize = require('../src/config/database');

async function addDescriptionColumn() {
  try {
    console.log('正在添加 description 字段到 matches 表...');

    await sequelize.query(`
      ALTER TABLE matches
      ADD COLUMN description TEXT NULL
      COMMENT '比赛说明'
      AFTER location
    `);

    console.log('✓ description 字段添加成功！');

    // 验证字段是否添加成功
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM matches WHERE Field = 'description'
    `);

    if (results.length > 0) {
      console.log('✓ 验证成功，字段信息：', results[0]);
    }

    process.exit(0);
  } catch (error) {
    if (error.message.includes("Duplicate column name")) {
      console.log('⚠ description 字段已存在，跳过添加');
      process.exit(0);
    } else {
      console.error('✗ 添加字段失败：', error.message);
      process.exit(1);
    }
  }
}

addDescriptionColumn();
