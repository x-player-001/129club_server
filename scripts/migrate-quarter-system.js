/**
 * 4节制比赛系统数据库迁移脚本
 * 新增表：match_quarters, match_participants
 * 修改表：matches, match_results, match_events
 */

const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrateQuarterSystem() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始4节制比赛系统数据库迁移...');

    // 1. 修改 matches 表 - 添加4节制相关字段
    await sequelize.query(`
      ALTER TABLE matches
      ADD COLUMN quarter_system BOOLEAN DEFAULT false
        COMMENT '是否使用4节制（true=4节制，false=传统全场制）',
      ADD COLUMN final_team1_score INT DEFAULT 0
        COMMENT '队伍1最终得分（4节制累计分数）',
      ADD COLUMN final_team2_score INT DEFAULT 0
        COMMENT '队伍2最终得分（4节制累计分数）'
    `, { transaction });

    logger.info('✓ matches 表字段添加完成');

    // 2. 创建 match_quarters 表（比赛节次表）
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS match_quarters (
        id CHAR(36) PRIMARY KEY,
        match_id CHAR(36) NOT NULL COMMENT '比赛ID',
        quarter_number TINYINT NOT NULL COMMENT '节次编号 1-4',
        team1_goals INT DEFAULT 0 COMMENT '队伍1进球数',
        team2_goals INT DEFAULT 0 COMMENT '队伍2进球数',
        team1_points INT DEFAULT 0 COMMENT '队伍1本节得分（1或2分）',
        team2_points INT DEFAULT 0 COMMENT '队伍2本节得分（0、1或2分）',
        duration_minutes INT DEFAULT 20 COMMENT '节次时长（分钟）',
        summary TEXT COMMENT '本节文字总结',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_match_quarter (match_id, quarter_number),
        INDEX idx_match_id (match_id),
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛节次表'
    `, { transaction });

    logger.info('✓ match_quarters 表创建完成');

    // 3. 创建 match_participants 表（到场人员表）
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS match_participants (
        id CHAR(36) PRIMARY KEY,
        match_id CHAR(36) NOT NULL COMMENT '比赛ID',
        team_id CHAR(36) NOT NULL COMMENT '队伍ID',
        user_id CHAR(36) NOT NULL COMMENT '用户ID',
        is_present BOOLEAN DEFAULT true COMMENT '是否到场',
        arrival_time TIMESTAMP NULL COMMENT '到场时间',
        notes VARCHAR(255) COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_match_team_user (match_id, team_id, user_id),
        INDEX idx_match_id (match_id),
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛到场人员表'
    `, { transaction });

    logger.info('✓ match_participants 表创建完成');

    // 4. 修改 match_events 表 - 添加节次和事件子类型
    await sequelize.query(`
      ALTER TABLE match_events
      ADD COLUMN quarter_number TINYINT COMMENT '发生在第几节（1-4）',
      ADD COLUMN event_subtype VARCHAR(20) COMMENT '事件子类型（如：far_shot远射, penalty点球）'
    `, { transaction });

    logger.info('✓ match_events 表字段添加完成');

    // 5. 扩展 match_events 的 event_type 枚举
    await sequelize.query(`
      ALTER TABLE match_events
      MODIFY COLUMN event_type
        ENUM('goal', 'assist', 'save', 'yellow_card', 'red_card',
             'substitution_in', 'substitution_out', 'referee')
        NOT NULL COMMENT '事件类型（新增save扑救、referee裁判）'
    `, { transaction });

    logger.info('✓ match_events 事件类型扩展完成');

    // 6. 修改 match_results 表 - 添加4节制相关字段
    await sequelize.query(`
      ALTER TABLE match_results
      ADD COLUMN quarter_system BOOLEAN DEFAULT false COMMENT '是否4节制',
      ADD COLUMN team1_final_score INT COMMENT '队伍1最终得分（4节制）',
      ADD COLUMN team2_final_score INT COMMENT '队伍2最终得分（4节制）',
      ADD COLUMN team1_total_goals INT COMMENT '队伍1总进球数',
      ADD COLUMN team2_total_goals INT COMMENT '队伍2总进球数',
      ADD COLUMN raw_report TEXT COMMENT '原始简报文本',
      ADD COLUMN parsed_by_ai BOOLEAN DEFAULT false COMMENT '是否由AI解析导入'
    `, { transaction });

    logger.info('✓ match_results 表字段添加完成');

    await transaction.commit();

    logger.info('');
    logger.info('====================================');
    logger.info('4节制比赛系统数据库迁移完成！');
    logger.info('====================================');
    logger.info('迁移内容:');
    logger.info('1. matches 表: 新增 quarter_system, final_team1_score, final_team2_score');
    logger.info('2. 新建 match_quarters 表');
    logger.info('3. 新建 match_participants 表');
    logger.info('4. match_events 表: 新增 quarter_number, event_subtype');
    logger.info('5. match_events 表: 扩展 event_type 枚举（save, referee）');
    logger.info('6. match_results 表: 新增多个4节制相关字段');

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('数据库迁移失败:', error);
    console.error(error);
    process.exit(1);
  }
}

// 执行迁移
migrateQuarterSystem();
