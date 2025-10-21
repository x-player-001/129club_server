const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchResult = sequelize.define('MatchResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '结果ID'
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'match_id',
    comment: '比赛ID'
  },
  team1Score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'team1_score',
    comment: '队伍1得分'
  },
  team2Score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'team2_score',
    comment: '队伍2得分'
  },
  winnerTeamId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'winner_team_id',
    comment: '获胜队伍ID'
  },
  mvpUserIds: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'mvp_user_ids',
    comment: 'MVP用户ID数组'
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '比赛照片URL数组'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '比赛总结'
  },
  quarterSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'quarter_system',
    comment: '是否4节制'
  },
  team1FinalScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'team1_final_score',
    comment: '队伍1最终得分（4节制）'
  },
  team2FinalScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'team2_final_score',
    comment: '队伍2最终得分（4节制）'
  },
  team1TotalGoals: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'team1_total_goals',
    comment: '队伍1总进球数'
  },
  team2TotalGoals: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'team2_total_goals',
    comment: '队伍2总进球数'
  },
  rawReport: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'raw_report',
    comment: '原始简报文本'
  },
  parsedByAi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'parsed_by_ai',
    comment: '是否由AI解析导入'
  },
  submittedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'submitted_by',
    comment: '提交者ID'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'submitted_at',
    comment: '提交时间'
  }
}, {
  tableName: 'match_results',
  timestamps: false,
  underscored: true
});

module.exports = MatchResult;
