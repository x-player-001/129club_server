const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    timezone: config.database.timezone,
    pool: config.database.pool,
    logging: config.database.logging,
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    logger.info('✅ Database connection has been established successfully.');
  })
  .catch(err => {
    logger.error('❌ Unable to connect to the database:', err);
  });

module.exports = sequelize;
