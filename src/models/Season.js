const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Season = sequelize.define('Season', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '赛季ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '赛季名称，如"2025-S1"，可重复可修改'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '赛季标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '赛季说明'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date',
    comment: '赛季开始日期'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date',
    comment: '赛季结束日期'
  },
  maxMatches: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'max_matches',
    comment: '赛季最大比赛场数'
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed', 'archived'),
    defaultValue: 'upcoming',
    comment: '赛季状态：upcoming=即将开始, active=进行中, completed=已完成, archived=已归档'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    comment: '创建者ID'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
    comment: '完成时间'
  }
}, {
  tableName: 'seasons',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['start_date'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Season;
