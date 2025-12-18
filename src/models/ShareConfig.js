const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShareConfig = sequelize.define('ShareConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '配置ID'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '分享标题'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url',
    comment: '分享图片URL'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '分享描述'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: '是否有效'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'share_configs',
  timestamps: true,
  underscored: true
});

module.exports = ShareConfig;
