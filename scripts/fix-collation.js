/**
 * 修复表 collation 为 utf8mb4_0900_ai_ci
 * 运行: node scripts/fix-collation.js
 */

const { Sequelize } = require('sequelize');

const DB_CONFIG = {
  host: '106.53.217.216',
  port: 3306,
  database: '129club',
  username: '129user',
  password: '129_User'
};

const sequelize = new Sequelize(DB_CONFIG.database, DB_CONFIG.username, DB_CONFIG.password, {
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  dialect: 'mysql',
  logging: false,
  timezone: '+08:00'
});

async function fixCollation() {
  try {
    console.log('连接数据库...');
    await sequelize.authenticate();
    console.log('连接成功!\n');

    const tables = ['club_years', 'player_values', 'player_yearly_values'];

    for (const table of tables) {
      console.log(`修复 ${table} 表 collation...`);
      await sequelize.query(`
        ALTER TABLE ${table} 
        CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
      `);
      console.log(`  ✓ ${table} 修复完成`);
    }

    console.log('\n所有表 collation 修复完成!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('修复失败:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

fixCollation();
