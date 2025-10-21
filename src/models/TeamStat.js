const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamStat = sequelize.define('TeamStat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '统计ID'
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'team_id',
    comment: '队伍ID'
  },
  season: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '赛季'
  },
  matchesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'matches_played',
    comment: '比赛场次'
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
  goalsFor: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'goals_for',
    comment: '进球数'
  },
  goalsAgainst: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'goals_against',
    comment: '失球数'
  },
  goalDifference: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'goal_difference',
    comment: '净胜球'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '积分（胜3平1负0）'
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
  tableName: 'team_stats',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['season'] },
    { fields: ['points'] },
    { fields: ['goals_for'] }
  ]
});

module.exports = TeamStat;
