const { ShareConfig } = require('../models');
const logger = require('../utils/logger');

/**
 * 获取当前有效的分享配置
 */
exports.getActiveConfig = async () => {
  const config = await ShareConfig.findOne({
    where: { isActive: true },
    order: [['createdAt', 'DESC']]
  });

  if (!config) {
    return {
      title: '比赛报名',
      imageUrl: null,
      description: null,
      isDefault: true
    };
  }

  return {
    id: config.id,
    title: config.title,
    imageUrl: config.imageUrl,
    description: config.description,
    isDefault: false,
    createdAt: config.createdAt
  };
};

/**
 * 获取所有分享配置历史记录
 */
exports.getConfigHistory = async () => {
  const configs = await ShareConfig.findAll({
    order: [['createdAt', 'DESC']]
  });

  return configs.map(config => ({
    id: config.id,
    title: config.title,
    imageUrl: config.imageUrl,
    description: config.description,
    isActive: config.isActive,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt
  }));
};

/**
 * 创建新的分享配置（会将之前的配置设为无效）
 * @param {Object} data 配置数据
 */
exports.createConfig = async (data) => {
  const { title, imageUrl, description } = data;

  // 将所有现有配置设为无效
  await ShareConfig.update(
    { isActive: false },
    { where: { isActive: true } }
  );

  // 创建新配置
  const config = await ShareConfig.create({
    title,
    imageUrl,
    description,
    isActive: true
  });

  logger.info(`创建新分享配置: ${config.id}`);

  return {
    id: config.id,
    title: config.title,
    imageUrl: config.imageUrl,
    description: config.description,
    isActive: config.isActive,
    createdAt: config.createdAt
  };
};

/**
 * 激活指定的历史配置
 * @param {string} configId 配置ID
 */
exports.activateConfig = async (configId) => {
  const config = await ShareConfig.findByPk(configId);
  if (!config) {
    throw new Error('配置不存在');
  }

  // 将所有配置设为无效
  await ShareConfig.update(
    { isActive: false },
    { where: { isActive: true } }
  );

  // 激活指定配置
  await config.update({ isActive: true });

  logger.info(`激活分享配置: ${configId}`);

  return {
    id: config.id,
    title: config.title,
    imageUrl: config.imageUrl,
    description: config.description,
    isActive: true,
    createdAt: config.createdAt
  };
};

/**
 * 删除指定配置（不能删除当前激活的配置）
 * @param {string} configId 配置ID
 */
exports.deleteConfig = async (configId) => {
  const config = await ShareConfig.findByPk(configId);
  if (!config) {
    throw new Error('配置不存在');
  }

  if (config.isActive) {
    throw new Error('不能删除当前激活的配置');
  }

  await config.destroy();
  logger.info(`删除分享配置: ${configId}`);

  return { success: true };
};
