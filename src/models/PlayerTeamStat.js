const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlayerTeamStat = sequelize.define('PlayerTeamStat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '统计ID'
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
    comment: '队伍ID'
  },
  season: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'season_id',
    comment: '赛季ID'
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
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'player_team_stats',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'team_id', 'season'],
      unique: true,
      name: 'uk_user_team_season'
    },
    { fields: ['team_id', 'season'] }
  ]
});

module.exports = PlayerTeamStat;
