/**
 * 身价系统数据库迁移脚本
 * 运行方式: node scripts/migrate-value-system.js
 */

require('dotenv').config();
const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrate() {
  try {
    console.log('开始身价系统数据库迁移...\n');

    // 1. 创建 club_years 表（俱乐部年度配置）
    console.log('1. 创建 club_years 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS club_years (
        id VARCHAR(36) PRIMARY KEY,
        year INT NOT NULL UNIQUE COMMENT '俱乐部年度（如12表示第12年）',
        name VARCHAR(50) NOT NULL COMMENT '年度名称（如"第12年"）',
        start_date DATE NOT NULL COMMENT '年度开始日期',
        end_date DATE NOT NULL COMMENT '年度结束日期',
        stay_line INT DEFAULT 5000 COMMENT '留队线（万）',
        is_active TINYINT(1) DEFAULT 0 COMMENT '是否为当前活跃年度',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_year (year),
        INDEX idx_active (is_active),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ club_years 表创建成功\n');

    // 2. 创建 player_values 表（身价记录）
    console.log('2. 创建 player_values 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS player_values (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL COMMENT '球员ID',
        club_year INT NOT NULL COMMENT '俱乐部年度',
        match_id VARCHAR(36) NULL COMMENT '关联比赛ID',
        season_id VARCHAR(36) NULL COMMENT '关联赛季ID',
        source_type ENUM('attendance', 'role', 'result', 'data', 'service', 'special') NOT NULL COMMENT '身价来源类型',
        source_detail VARCHAR(200) NULL COMMENT '详细描述',
        base_amount INT NOT NULL DEFAULT 0 COMMENT '基础金额（万）',
        multiplier DECIMAL(3,1) NOT NULL DEFAULT 1.0 COMMENT '倍率',
        final_amount INT NOT NULL DEFAULT 0 COMMENT '最终金额（万）',
        status ENUM('auto', 'pending', 'approved', 'rejected') DEFAULT 'auto' COMMENT '状态',
        approved_by VARCHAR(36) NULL COMMENT '审核人ID',
        approved_at TIMESTAMP NULL COMMENT '审核时间',
        notes TEXT NULL COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_club_year (club_year),
        INDEX idx_match (match_id),
        INDEX idx_source_type (source_type),
        INDEX idx_status (status),
        INDEX idx_user_year (user_id, club_year),
        INDEX idx_user_match_type (user_id, match_id, source_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
        FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ player_values 表创建成功\n');

    // 3. 创建 player_yearly_values 表（年度身价汇总）
    console.log('3. 创建 player_yearly_values 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS player_yearly_values (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL COMMENT '球员ID',
        club_year INT NOT NULL COMMENT '俱乐部年度',
        total_value INT DEFAULT 0 COMMENT '累计总身价（万）',
        attendance_value INT DEFAULT 0 COMMENT '出勤身价小计',
        role_value INT DEFAULT 0 COMMENT '角色身价小计',
        result_value INT DEFAULT 0 COMMENT '战绩身价小计',
        data_value INT DEFAULT 0 COMMENT '数据身价小计',
        service_value INT DEFAULT 0 COMMENT '服务身价小计',
        special_value INT DEFAULT 0 COMMENT '特殊奖励小计',
        match_count INT DEFAULT 0 COMMENT '参赛场次',
        external_match_count INT DEFAULT 0 COMMENT '外战场次',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_year (user_id, club_year),
        INDEX idx_club_year (club_year),
        INDEX idx_total_value (total_value),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✓ player_yearly_values 表创建成功\n');

    // 4. 给 matches 表添加 match_type 字段
    console.log('4. 给 matches 表添加 match_type 字段...');
    try {
      await sequelize.query(`
        ALTER TABLE matches
        ADD COLUMN match_type ENUM('internal', 'external') DEFAULT 'internal'
        COMMENT '比赛类型（internal=内战，external=外战）'
        AFTER season_id;
      `);
      console.log('   ✓ match_type 字段添加成功\n');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('   - match_type 字段已存在，跳过\n');
      } else {
        throw error;
      }
    }

    // 5. 给 matches 表添加索引
    console.log('5. 给 matches 表添加 match_type 索引...');
    try {
      await sequelize.query(`
        ALTER TABLE matches ADD INDEX idx_match_type (match_type);
      `);
      console.log('   ✓ 索引添加成功\n');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('   - 索引已存在，跳过\n');
      } else {
        throw error;
      }
    }

    // 6. 给 users 表添加 is_outside_player 字段
    console.log('6. 给 users 表添加 is_outside_player 字段...');
    try {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN is_outside_player TINYINT(1) DEFAULT 0
        COMMENT '是否为外地球员（外地球员出勤身价+1000万/场）'
        AFTER join_date;
      `);
      console.log('   ✓ is_outside_player 字段添加成功\n');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('   - is_outside_player 字段已存在，跳过\n');
      } else {
        throw error;
      }
    }

    // 7. 初始化俱乐部年度数据
    console.log('7. 初始化俱乐部年度数据...');
    const years = [
      { year: 11, name: '第11年', startDate: '2023-12-09', endDate: '2024-12-08', stayLine: 5000, isActive: false },
      { year: 12, name: '第12年', startDate: '2024-12-09', endDate: '2025-12-08', stayLine: 5000, isActive: true },
      { year: 13, name: '第13年', startDate: '2025-12-09', endDate: '2026-12-08', stayLine: 5000, isActive: false }
    ];

    for (const yearData of years) {
      try {
        await sequelize.query(`
          INSERT INTO club_years (id, year, name, start_date, end_date, stay_line, is_active)
          VALUES (UUID(), :year, :name, :startDate, :endDate, :stayLine, :isActive)
          ON DUPLICATE KEY UPDATE
            name = :name,
            start_date = :startDate,
            end_date = :endDate,
            stay_line = :stayLine,
            is_active = :isActive
        `, {
          replacements: yearData
        });
        console.log(`   ✓ ${yearData.name} 初始化成功`);
      } catch (error) {
        console.log(`   ! ${yearData.name} 初始化失败: ${error.message}`);
      }
    }
    console.log();

    console.log('========================================');
    console.log('身价系统数据库迁移完成！');
    console.log('========================================\n');

    console.log('新增表:');
    console.log('  - club_years (俱乐部年度配置)');
    console.log('  - player_values (身价记录)');
    console.log('  - player_yearly_values (年度身价汇总)\n');

    console.log('新增字段:');
    console.log('  - matches.match_type (比赛类型: internal/external)');
    console.log('  - users.is_outside_player (外地球员标识)\n');

    console.log('身价规则:');
    console.log('  - 出勤: 100万 (外地球员额外+1000万)');
    console.log('  - 守门/裁判: 50万/节');
    console.log('  - 胜利: 50万, 平局: 20万, MVP: 50万');
    console.log('  - 进球/助攻: 50万/次 (仅外战)');
    console.log('  - 零封: 100万 (后卫/门将, 仅外战)');
    console.log('  - 外战所有奖励翻倍\n');

    process.exit(0);

  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

migrate();
