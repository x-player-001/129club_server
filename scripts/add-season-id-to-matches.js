const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function addSeasonIdToMatches() {
  try {
    logger.info('开始给matches表添加season_id字段...');

    // 添加season_id字段
    await sequelize.query(`
      ALTER TABLE matches
      ADD COLUMN season_id VARCHAR(36) DEFAULT NULL
      COMMENT '所属赛季ID'
      AFTER final_team2_score
    `);

    logger.info('season_id字段添加成功！');

    // 添加索引
    await sequelize.query(`
      ALTER TABLE matches
      ADD INDEX idx_season_id (season_id)
    `);

    logger.info('season_id索引创建成功！');

    // 添加外键约束（可选）
    await sequelize.query(`
      ALTER TABLE matches
      ADD CONSTRAINT fk_matches_season
      FOREIGN KEY (season_id) REFERENCES seasons(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);

    logger.info('season_id外键约束创建成功！');

  } catch (error) {
    logger.error('添加season_id字段失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行迁移
addSeasonIdToMatches()
  .then(() => {
    logger.info('迁移完成');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('迁移失败:', error);
    process.exit(1);
  });
