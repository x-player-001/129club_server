const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '报名ID'
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'match_id',
    comment: '比赛ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'team_id',
    comment: '队伍ID（报名时所属队伍）'
  },
  status: {
    type: DataTypes.ENUM('registered', 'confirmed', 'cancelled'),
    defaultValue: 'registered',
    comment: '报名状态'
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'registered_at',
    comment: '报名时间'
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'registrations',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['match_id', 'user_id'],
      unique: true,
      name: 'uk_match_user'
    },
    { fields: ['match_id'] },
    { fields: ['user_id'] },
    { fields: ['team_id'] }
  ]
});

module.exports = Registration;
