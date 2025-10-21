const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    console.log('🔌 连接到MySQL服务器...');

    // 先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      multipleStatements: true // 允许执行多条SQL语句
    });

    console.log('✅ MySQL连接成功');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'init-database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 读取SQL脚本文件...');
    console.log('🚀 开始执行数据库迁移...');

    // 执行SQL脚本
    await connection.query(sql);

    console.log('✅ 数据库迁移完成！');
    console.log('📊 已创建以下数据表：');
    console.log('   1. users - 用户表');
    console.log('   2. permissions - 权限表');
    console.log('   3. teams - 队伍表');
    console.log('   4. team_members - 队伍成员关系表');
    console.log('   5. team_reshuffles - 队伍重组记录表');
    console.log('   6. draft_picks - Draft选人记录表');
    console.log('   7. matches - 比赛表');
    console.log('   8. registrations - 比赛报名表');
    console.log('   9. lineups - 比赛阵容表');
    console.log('  10. match_events - 比赛事件表');
    console.log('  11. match_results - 比赛结果表');
    console.log('  12. player_stats - 球员总体统计表');
    console.log('  13. player_team_stats - 球员队内统计表');
    console.log('  14. team_stats - 队伍统计表');
    console.log('  15. notices - 公告表');

    // 验证表是否创建成功
    await connection.query(`USE ${process.env.DB_NAME}`);
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n✅ 数据库 ${process.env.DB_NAME} 中共有 ${tables.length} 张表`);

  } catch (error) {
    console.error('❌ 数据库迁移失败：', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行迁移
runMigration();
