const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 球员年度身价汇总表
 * 用于快速查询球员年度累计身价
 */
const PlayerYearlyValue = sequelize.define('PlayerYearlyValue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '记录ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: '球员ID'
  },
  clubYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'club_year',
    comment: '俱乐部年度'
  },
  totalValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_value',
    comment: '累计总身价（万）'
  },
  attendanceValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'attendance_value',
    comment: '出勤身价小计（万）'
  },
  roleValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'role_value',
    comment: '角色身价小计（万）'
  },
  resultValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'result_value',
    comment: '战绩身价小计（万）'
  },
  dataValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'data_value',
    comment: '数据身价小计（万）'
  },
  serviceValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'service_value',
    comment: '服务身价小计（万）'
  },
  specialValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'special_value',
    comment: '特殊奖励小计（万）'
  },
  matchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'match_count',
    comment: '参赛场次'
  },
  externalMatchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'external_match_count',
    comment: '外战场次'
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
  tableName: 'player_yearly_values',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'club_year'], unique: true },
    { fields: ['club_year'] },
    { fields: ['total_value'] }
  ]
});

module.exports = PlayerYearlyValue;
