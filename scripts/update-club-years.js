/**
 * 更新俱乐部年度数据
 * 运行: node scripts/update-club-years.js
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

async function updateClubYears() {
  try {
    console.log('连接数据库...');
    await sequelize.authenticate();
    console.log('连接成功!\n');

    // 1. 删除第11年和第13年
    console.log('删除第11年和第13年...');
    await sequelize.query(`DELETE FROM club_years WHERE year IN (11, 13)`);
    console.log('  ✓ 删除完成');

    // 2. 更新第12年名称为"2026年度"
    console.log('更新第12年名称为"2026年度"...');
    await sequelize.query(`UPDATE club_years SET name = '2026年度' WHERE year = 12`);
    console.log('  ✓ 更新完成');

    // 3. 查看结果
    console.log('\n当前俱乐部年度数据:');
    const [rows] = await sequelize.query(`SELECT * FROM club_years`);
    console.table(rows);

    await sequelize.close();
    console.log('\n数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

updateClubYears();
