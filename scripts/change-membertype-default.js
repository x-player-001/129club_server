const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function changeMemberTypeDefault() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始修改 member_type 字段默认值...');

    // 修改字段默认值为 temporary
    await sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN member_type ENUM('regular', 'temporary') DEFAULT 'temporary'
        COMMENT '队员类型（regular=正式队员, temporary=临时队员）'
    `, { transaction });

    await transaction.commit();

    logger.info('');
    logger.info('====================================');
    logger.info('member_type 字段默认值修改完成！');
    logger.info('====================================');
    logger.info('✓ 默认值已从 regular 改为 temporary');
    logger.info('✓ 已有用户的 member_type 不会改变');
    logger.info('✓ 仅影响新创建的用户');
    logger.info('');
    logger.info('说明:');
    logger.info('- temporary: 临时队员（新的默认值）');
    logger.info('- regular: 正式队员');

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('修改 member_type 字段默认值失败:', error);
    console.error(error);
    process.exit(1);
  }
}

changeMemberTypeDefault()
  .then(() => {
    console.log('迁移完成');
    process.exit(0);
  })
  .catch(err => {
    console.error('迁移失败:', err);
    process.exit(1);
  });
