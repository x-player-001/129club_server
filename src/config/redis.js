const redis = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

// 创建Redis客户端
const redisClient = redis.createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port
  },
  password: config.redis.password,
  database: config.redis.db
});

// 连接Redis
redisClient.connect().then(() => {
  logger.info('✅ Redis connection has been established successfully.');
}).catch(err => {
  logger.error('❌ Unable to connect to Redis:', err);
});

// 错误处理
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

// 封装常用方法
const redisUtil = {
  /**
   * 设置缓存
   * @param {string} key 键
   * @param {any} value 值
   * @param {number} expire 过期时间（秒）
   */
  async set(key, value, expire = 3600) {
    const prefixedKey = config.redis.keyPrefix + key;
    const stringValue = JSON.stringify(value);
    if (expire) {
      await redisClient.setEx(prefixedKey, expire, stringValue);
    } else {
      await redisClient.set(prefixedKey, stringValue);
    }
  },

  /**
   * 获取缓存
   * @param {string} key 键
   */
  async get(key) {
    const prefixedKey = config.redis.keyPrefix + key;
    const value = await redisClient.get(prefixedKey);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  },

  /**
   * 删除缓存
   * @param {string} key 键
   */
  async del(key) {
    const prefixedKey = config.redis.keyPrefix + key;
    await redisClient.del(prefixedKey);
  },

  /**
   * 检查键是否存在
   * @param {string} key 键
   */
  async exists(key) {
    const prefixedKey = config.redis.keyPrefix + key;
    return await redisClient.exists(prefixedKey);
  },

  /**
   * 设置过期时间
   * @param {string} key 键
   * @param {number} seconds 秒数
   */
  async expire(key, seconds) {
    const prefixedKey = config.redis.keyPrefix + key;
    await redisClient.expire(prefixedKey, seconds);
  },

  /**
   * 清空所有缓存（谨慎使用）
   */
  async flushAll() {
    await redisClient.flushAll();
    logger.warn('Redis: All cache has been flushed!');
  }
};

module.exports = { redisClient, redisUtil };
