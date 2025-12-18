const shareConfigService = require('../services/shareConfig.service');
const logger = require('../utils/logger');

/**
 * 获取当前有效的分享配置
 */
exports.getActiveConfig = async (ctx) => {
  try {
    const config = await shareConfigService.getActiveConfig();
    ctx.body = {
      code: 0,
      message: 'success',
      data: config
    };
  } catch (error) {
    logger.error('获取分享配置失败:', error);
    ctx.body = {
      code: 1,
      message: error.message || '获取分享配置失败'
    };
  }
};

/**
 * 获取分享配置历史记录
 */
exports.getConfigHistory = async (ctx) => {
  try {
    const configs = await shareConfigService.getConfigHistory();
    ctx.body = {
      code: 0,
      message: 'success',
      data: configs
    };
  } catch (error) {
    logger.error('获取分享配置历史失败:', error);
    ctx.body = {
      code: 1,
      message: error.message || '获取分享配置历史失败'
    };
  }
};

/**
 * 创建新的分享配置
 */
exports.createConfig = async (ctx) => {
  try {
    const { title, imageUrl, description } = ctx.request.body;

    if (!title && !imageUrl) {
      ctx.body = {
        code: 1,
        message: '标题和图片至少需要填写一项'
      };
      return;
    }

    const config = await shareConfigService.createConfig({
      title,
      imageUrl,
      description
    });

    ctx.body = {
      code: 0,
      message: 'success',
      data: config
    };
  } catch (error) {
    logger.error('创建分享配置失败:', error);
    ctx.body = {
      code: 1,
      message: error.message || '创建分享配置失败'
    };
  }
};

/**
 * 激活指定的历史配置
 */
exports.activateConfig = async (ctx) => {
  try {
    const { configId } = ctx.params;
    const config = await shareConfigService.activateConfig(configId);
    ctx.body = {
      code: 0,
      message: 'success',
      data: config
    };
  } catch (error) {
    logger.error('激活分享配置失败:', error);
    ctx.body = {
      code: 1,
      message: error.message || '激活分享配置失败'
    };
  }
};

/**
 * 删除指定配置
 */
exports.deleteConfig = async (ctx) => {
  try {
    const { configId } = ctx.params;
    await shareConfigService.deleteConfig(configId);
    ctx.body = {
      code: 0,
      message: 'success'
    };
  } catch (error) {
    logger.error('删除分享配置失败:', error);
    ctx.body = {
      code: 1,
      message: error.message || '删除分享配置失败'
    };
  }
};
