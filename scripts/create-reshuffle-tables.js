/**
 * 队伍重组和Draft选人功能数据库迁移脚本
 * 创建 team_reshuffles 和 draft_picks 表
 */

const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function createReshuffleTables() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始创建队伍重组相关表...');

    // 1. 创建 team_reshuffles 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS team_reshuffles (
        id CHAR(36) PRIMARY KEY COMMENT '重组ID',
        season VARCHAR(20) NOT NULL COMMENT '赛季',
        initiator_id CHAR(36) NOT NULL COMMENT '发起人ID',
        captain1_id CHAR(36) DEFAULT NULL COMMENT '队长1 ID',
        captain2_id CHAR(36) DEFAULT NULL COMMENT '队长2 ID',
        team1_id CHAR(36) DEFAULT NULL COMMENT '队伍1 ID',
        team2_id CHAR(36) DEFAULT NULL COMMENT '队伍2 ID',
        status ENUM('draft_in_progress', 'completed', 'cancelled') DEFAULT 'draft_in_progress' COMMENT '状态',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
        completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
        INDEX idx_season (season),
        INDEX idx_status (status),
        FOREIGN KEY (initiator_id) REFERENCES users(id),
        FOREIGN KEY (captain1_id) REFERENCES users(id),
        FOREIGN KEY (captain2_id) REFERENCES users(id),
        FOREIGN KEY (team1_id) REFERENCES teams(id),
        FOREIGN KEY (team2_id) REFERENCES teams(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='队伍重组记录表';
    `, { transaction });

    logger.info('✓ team_reshuffles 表创建完成');

    // 2. 创建 draft_picks 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS draft_picks (
        id CHAR(36) PRIMARY KEY COMMENT '选人记录ID',
        reshuffle_id CHAR(36) NOT NULL COMMENT '重组ID',
        round INT NOT NULL COMMENT '轮次',
        pick_order INT NOT NULL COMMENT '选人顺序（全局）',
        captain_id CHAR(36) NOT NULL COMMENT '队长ID',
        picked_user_id CHAR(36) NOT NULL COMMENT '被选中的用户ID',
        team_id CHAR(36) NOT NULL COMMENT '队伍ID',
        picked_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '选择时间',
        INDEX idx_reshuffle_id (reshuffle_id),
        INDEX idx_round (round),
        INDEX idx_picked_user_id (picked_user_id),
        INDEX idx_team_id (team_id),
        FOREIGN KEY (reshuffle_id) REFERENCES team_reshuffles(id) ON DELETE CASCADE,
        FOREIGN KEY (captain_id) REFERENCES users(id),
        FOREIGN KEY (picked_user_id) REFERENCES users(id),
        FOREIGN KEY (team_id) REFERENCES teams(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Draft选人记录表';
    `, { transaction });

    logger.info('✓ draft_picks 表创建完成');

    await transaction.commit();

    logger.info('');
    logger.info('====================================');
    logger.info('队伍重组表创建完成！');
    logger.info('====================================');
    logger.info('');
    logger.info('已创建表:');
    logger.info('1. team_reshuffles - 队伍重组记录');
    logger.info('2. draft_picks - Draft选人记录');
    logger.info('');
    logger.info('功能说明:');
    logger.info('- 支持定期队伍重组');
    logger.info('- 记录完整的Draft选人过程');
    logger.info('- 可查询球员的队伍历史（转会记录）');
    logger.info('- 支持蛇形选人规则 (1-2-2-2...)');

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('创建队伍重组表失败:', error);
    console.error(error);
    process.exit(1);
  }
}

// 执行迁移
createReshuffleTables();
