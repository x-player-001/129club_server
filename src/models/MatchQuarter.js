const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchQuarter = sequelize.define('MatchQuarter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '节次ID'
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'match_id',
    comment: '比赛ID'
  },
  quarterNumber: {
    type: DataTypes.TINYINT,
    allowNull: false,
    field: 'quarter_number',
    comment: '节次编号 1-4'
  },
  team1Goals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'team1_goals',
    comment: '队伍1进球数'
  },
  team2Goals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'team2_goals',
    comment: '队伍2进球数'
  },
  team1Points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'team1_points',
    comment: '队伍1本节得分（1或2分）'
  },
  team2Points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'team2_points',
    comment: '队伍2本节得分（0、1或2分）'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    field: 'duration_minutes',
    comment: '节次时长（分钟）'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '本节文字总结'
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'in_progress',
    comment: '节次状态：in_progress=进行中, completed=已完成'
  },
  mainRefereeId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'main_referee_id',
    comment: '主裁判ID'
  },
  assistantReferee1Id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assistant_referee1_id',
    comment: '边裁1 ID'
  },
  assistantReferee2Id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assistant_referee2_id',
    comment: '边裁2 ID'
  },
  team1GoalkeeperId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'team1_goalkeeper_id',
    comment: '队伍1守门员ID'
  },
  team2GoalkeeperId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'team2_goalkeeper_id',
    comment: '队伍2守门员ID'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'match_quarters',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['match_id'] },
    {
      fields: ['match_id', 'quarter_number'],
      unique: true,
      name: 'uk_match_quarter'
    }
  ]
});

module.exports = MatchQuarter;
