const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchParticipant = sequelize.define('MatchParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '记录ID'
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'match_id',
    comment: '比赛ID'
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'team_id',
    comment: '队伍ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  isPresent: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_present',
    comment: '是否到场'
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'arrival_time',
    comment: '到场时间'
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  }
}, {
  tableName: 'match_participants',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['match_id'] },
    {
      fields: ['match_id', 'team_id', 'user_id'],
      unique: true,
      name: 'uk_match_team_user'
    }
  ]
});

module.exports = MatchParticipant;
