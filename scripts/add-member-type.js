/**
 * 添加队员类型字段迁移脚本
 * 在 users 表添加 member_type 字段区分正式队员和临时队员
 */

const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function addMemberTypeField() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始添加 member_type 字段...');

    // 1. 添加 member_type 字段
    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN member_type ENUM('regular', 'temporary') DEFAULT 'regular'
        COMMENT '队员类型（regular=正式队员, temporary=临时队员）'
    `, { transaction });

    logger.info('✓ member_type 字段添加完成');

    // 2. 将现有用户设置为正式队员
    await sequelize.query(`
      UPDATE users
      SET member_type = 'regular'
      WHERE member_type IS NULL
    `, { transaction });

    logger.info('✓ 现有用户已设置为正式队员');

    await transaction.commit();

    logger.info('');
    logger.info('====================================');
    logger.info('队员类型字段添加完成！');
    logger.info('====================================');
    logger.info('说明:');
    logger.info('- regular: 正式队员（默认值）');
    logger.info('- temporary: 临时队员');
    logger.info('');
    logger.info('正式队员: 俱乐部固定成员，参与所有统计');
    logger.info('临时队员: 临时参赛球员，可选择是否参与统计');

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('添加 member_type 字段失败:', error);
    console.error(error);
    process.exit(1);
  }
}

// 执行迁移
addMemberTypeField();
