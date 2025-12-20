const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 俱乐部年度配置表
 * 用于定义每个俱乐部年度的起止日期
 * 年度以球队成立纪念日（12月9日）为分界
 */
const ClubYear = sequelize.define('ClubYear', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '年度ID'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '俱乐部年度（如12表示第12年）'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '年度名称（如"第12年"）'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date',
    comment: '年度开始日期'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date',
    comment: '年度结束日期'
  },
  stayLine: {
    type: DataTypes.INTEGER,
    defaultValue: 5000,
    field: 'stay_line',
    comment: '留队线（万）'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_active',
    comment: '是否为当前活跃年度'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'club_years',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['year'], unique: true },
    { fields: ['is_active'] },
    { fields: ['start_date', 'end_date'] }
  ]
});

module.exports = ClubYear;
