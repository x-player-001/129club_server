const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 生成JWT Token
 * @param {Object} payload 载荷数据
 * @param {string} expiresIn 过期时间
 */
exports.generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * 验证JWT Token
 * @param {string} token Token字符串
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * 解码JWT Token（不验证）
 * @param {string} token Token字符串
 */
exports.decodeToken = (token) => {
  return jwt.decode(token);
};
