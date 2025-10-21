const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function createSeasonsTable() {
  try {
    logger.info('开始创建seasons表...');

    // 创建seasons表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id VARCHAR(36) PRIMARY KEY COMMENT '赛季ID',
        name VARCHAR(50) NOT NULL UNIQUE COMMENT '赛季名称，如2025-S1',
        title VARCHAR(100) DEFAULT NULL COMMENT '赛季标题',
        description TEXT DEFAULT NULL COMMENT '赛季说明',
        start_date DATETIME DEFAULT NULL COMMENT '赛季开始日期',
        end_date DATETIME DEFAULT NULL COMMENT '赛季结束日期',
        max_matches INT DEFAULT 10 COMMENT '赛季最大比赛场数',
        status ENUM('upcoming', 'active', 'completed', 'archived') DEFAULT 'upcoming' COMMENT '赛季状态',
        created_by VARCHAR(36) DEFAULT NULL COMMENT '创建者ID',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
        INDEX idx_name (name),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赛季表';
    `);

    logger.info('seasons表创建成功！');

  } catch (error) {
    logger.error('创建seasons表失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行迁移
createSeasonsTable()
  .then(() => {
    logger.info('迁移完成');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('迁移失败:', error);
    process.exit(1);
  });
