const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 位置字典表
 */
const Position = sequelize.define('Position', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    comment: '位置ID'
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '位置编码 (如: GK, CB, LB, RB等)'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '位置名称 (中文)'
  },
  nameEn: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'name_en',
    comment: '位置名称 (英文)'
  },
  category: {
    type: DataTypes.ENUM('GK', 'DF', 'MF', 'FW'),
    allowNull: false,
    comment: '位置大类: GK守门员 DF后卫 MF中场 FW前锋'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    comment: '排序顺序'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: '是否启用'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '位置描述'
  }
}, {
  tableName: 'positions',
  timestamps: false,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['category'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Position;
