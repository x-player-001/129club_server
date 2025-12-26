const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '106.53.217.216',
    port: 3306,
    user: '129user',
    password: '129_User',
    database: '129club'
  });

  const userId = 'fe6aebef-6f31-4cc1-baa0-4131c267d5f8';
  const clubYear = 13;

  // 重新统计各类型身价
  const [stats] = await conn.query(`
    SELECT source_type, SUM(final_amount) as total
    FROM player_values
    WHERE user_id = ? AND club_year = ? AND status IN ('auto', 'approved')
    GROUP BY source_type
  `, [userId, clubYear]);
  console.log('Stats by type:', stats);

  // 计算总值
  let totalValue = 0;
  const valueByType = {};
  for (const stat of stats) {
    valueByType[stat.source_type] = parseInt(stat.total) || 0;
    totalValue += parseInt(stat.total) || 0;
  }
  console.log('Total value:', totalValue);
  console.log('By type:', valueByType);

  // 更新汇总表
  await conn.query(`
    UPDATE player_yearly_values
    SET total_value = ?,
        attendance_value = ?,
        role_value = ?,
        result_value = ?,
        data_value = ?,
        service_value = ?,
        special_value = ?,
        updated_at = NOW()
    WHERE user_id = ? AND club_year = ?
  `, [
    totalValue,
    valueByType.attendance || 0,
    valueByType.role || 0,
    valueByType.result || 0,
    valueByType.data || 0,
    valueByType.service || 0,
    valueByType.special || 0,
    userId,
    clubYear
  ]);

  console.log('Updated yearly summary');

  // 验证更新结果
  const [updated] = await conn.query(`
    SELECT total_value, special_value FROM player_yearly_values
    WHERE user_id = ? AND club_year = ?
  `, [userId, clubYear]);
  console.log('After update:', updated);

  await conn.end();
}

run().catch(console.error);
