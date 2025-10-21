const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchEvent = sequelize.define('MatchEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '事件ID'
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
  eventType: {
    type: DataTypes.ENUM('goal', 'assist', 'yellow_card', 'red_card', 'substitution_in', 'substitution_out'),
    allowNull: false,
    field: 'event_type',
    comment: '事件类型'
  },
  eventSubtype: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'event_subtype',
    comment: '事件子类型（own_goal=乌龙球, penalty=点球, free_kick=任意球, header=头球等）'
  },
  quarterNumber: {
    type: DataTypes.TINYINT,
    allowNull: true,
    field: 'quarter_number',
    comment: '发生在第几节（1-4）'
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '发生时间（分钟）'
  },
  assistUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assist_user_id',
    comment: '助攻者ID（进球事件）'
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  },
  recordedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'recorded_by',
    comment: '记录者ID'
  },
  recordedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'recorded_at',
    comment: '记录时间'
  }
}, {
  tableName: 'match_events',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['match_id'] },
    { fields: ['event_type'] },
    { fields: ['user_id'] }
  ]
});

module.exports = MatchEvent;
