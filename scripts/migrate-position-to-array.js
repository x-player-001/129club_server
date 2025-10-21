/**
 * 位置字段迁移脚本
 * 将 users 表的 position 字段从 VARCHAR(20) 改为 TEXT，支持多选位置
 * 并将现有单个位置数据转换为 JSON 数组格式
 */

const sequelize = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migratePositionField() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始迁移 position 字段...');

    // 1. 修改字段类型为 TEXT
    await sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN position TEXT
      COMMENT '场上位置编码JSON数组 (支持多选, 如 ["CAM","LW","ST"])'
    `, { transaction });

    logger.info('字段类型已修改为 TEXT');

    // 2. 查询所有有位置数据的用户
    const [users] = await sequelize.query(`
      SELECT id, position
      FROM users
      WHERE position IS NOT NULL AND position != ''
    `, { transaction });

    logger.info(`找到 ${users.length} 个用户需要迁移位置数据`);

    // 3. 将单个位置字符串转换为 JSON 数组
    for (const user of users) {
      const { id, position } = user;

      // 检查是否已经是 JSON 格式
      let newPosition;
      try {
        const parsed = JSON.parse(position);
        if (Array.isArray(parsed)) {
          logger.info(`用户 ${id} 的位置已经是数组格式，跳过`);
          continue;
        }
        // 如果解析成功但不是数组，转为数组
        newPosition = JSON.stringify([position]);
      } catch (e) {
        // 如果不是 JSON，说明是旧的单个位置字符串
        newPosition = JSON.stringify([position]);
      }

      await sequelize.query(`
        UPDATE users
        SET position = ?
        WHERE id = ?
      `, {
        replacements: [newPosition, id],
        transaction
      });

      logger.info(`用户 ${id}: ${position} -> ${newPosition}`);
    }

    // 4. 将空字符串设置为 NULL
    await sequelize.query(`
      UPDATE users
      SET position = NULL
      WHERE position = ''
    `, { transaction });

    await transaction.commit();

    logger.info('位置字段迁移完成！');
    logger.info('迁移统计:');
    logger.info(`- 字段类型: VARCHAR(20) -> TEXT`);
    logger.info(`- 数据格式: 单个位置字符串 -> JSON数组`);
    logger.info(`- 迁移用户数: ${users.length}`);

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('位置字段迁移失败:', error);
    process.exit(1);
  }
}

// 执行迁移
migratePositionField();
