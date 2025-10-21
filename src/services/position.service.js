const Position = require('../models/position');
const logger = require('../utils/logger');

/**
 * 获取位置列表
 * @param {Object} params 查询参数
 */
exports.getPositionList = async (params = {}) => {
  const { category, isActive = true } = params;

  const where = {};

  // 按类别筛选
  if (category) {
    where.category = category;
  }

  // 只返回启用的位置
  if (isActive !== undefined) {
    where.isActive = isActive === 'true' || isActive === true;
  }

  const positions = await Position.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['id', 'ASC']]
  });

  logger.info(`Position list retrieved: ${positions.length} items`);

  return positions;
};

/**
 * 按类别分组获取位置列表
 */
exports.getPositionsByCategory = async () => {
  const positions = await Position.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC']]
  });

  // 按类别分组
  const grouped = {
    GK: [],
    DF: [],
    MF: [],
    FW: []
  };

  positions.forEach(pos => {
    if (grouped[pos.category]) {
      grouped[pos.category].push(pos);
    }
  });

  logger.info('Positions grouped by category');

  return grouped;
};
