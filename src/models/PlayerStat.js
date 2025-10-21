const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlayerStat = sequelize.define('PlayerStat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '统计ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
    comment: '用户ID'
  },
  matchesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'matches_played',
    comment: '参赛场次'
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '胜场'
  },
  draws: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '平局'
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '负场'
  },
  goals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '进球数'
  },
  assists: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '助攻数'
  },
  yellowCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'yellow_cards',
    comment: '黄牌数'
  },
  redCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'red_cards',
    comment: '红牌数'
  },
  mvpCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'mvp_count',
    comment: 'MVP次数'
  },
  attendanceRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'attendance_rate',
    comment: '出勤率'
  },
  winRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'win_rate',
    comment: '胜率'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'player_stats',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['goals'] },
    { fields: ['assists'] },
    { fields: ['mvp_count'] }
  ]
});

module.exports = PlayerStat;
