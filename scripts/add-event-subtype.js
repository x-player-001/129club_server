/**
 * 添加 event_subtype 字段支持乌龙球和其他事件子类型
 */

const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function addEventSubtype() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始添加 event_subtype 字段...');

    // 添加 event_subtype 字段
    await sequelize.query(`
      ALTER TABLE match_events
      ADD COLUMN event_subtype VARCHAR(50) NULL
        COMMENT '事件子类型（own_goal=乌龙球, penalty=点球, free_kick=任意球, header=头球等）'
    `, { transaction });

    logger.info('✓ event_subtype 字段添加完成');

    // 添加索引
    await sequelize.query(`
      ALTER TABLE match_events
      ADD INDEX idx_event_subtype (event_subtype)
    `, { transaction });

    logger.info('✓ event_subtype 索引添加完成');

    await transaction.commit();

    logger.info('');
    logger.info('====================================');
    logger.info('event_subtype 字段添加完成！');
    logger.info('====================================');
    logger.info('');
    logger.info('支持的进球子类型:');
    logger.info('- own_goal: 乌龙球');
    logger.info('- penalty: 点球');
    logger.info('- free_kick: 任意球');
    logger.info('- corner_kick: 角球破门');
    logger.info('- header: 头球');
    logger.info('- volley: 凌空抽射');
    logger.info('- bicycle_kick: 倒钩');
    logger.info('- long_shot: 远射');
    logger.info('');
    logger.info('支持的犯规子类型:');
    logger.info('- foul: 犯规');
    logger.info('- diving: 假摔');
    logger.info('- dissent: 异议');
    logger.info('- violent_conduct: 暴力行为');
    logger.info('- second_yellow: 两黄变红');
    logger.info('');
    logger.info('注意: 统计球员进球数时需排除 own_goal');

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('添加 event_subtype 字段失败:', error);
    console.error(error);
    process.exit(1);
  }
}

// 执行迁移
addEventSubtype();
