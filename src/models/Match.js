const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '比赛ID'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '比赛标题'
  },
  team1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'team1_id',
    comment: '队伍1 ID'
  },
  team2Id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'team2_id',
    comment: '队伍2 ID'
  },
  matchDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'match_date',
    comment: '比赛时间'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '比赛地点'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '比赛说明'
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'registration', 'lineup_set', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
    comment: '比赛状态'
  },
  registrationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'registration_deadline',
    comment: '报名截止时间'
  },
  maxPlayersPerTeam: {
    type: DataTypes.INTEGER,
    defaultValue: 11,
    field: 'max_players_per_team',
    comment: '每队最多报名人数'
  },
  quarterSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'quarter_system',
    comment: '是否使用4节制（true=4节制，false=传统全场制）'
  },
  finalTeam1Score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'final_team1_score',
    comment: '队伍1最终得分（4节制累计分数）'
  },
  finalTeam2Score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'final_team2_score',
    comment: '队伍2最终得分（4节制累计分数）'
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'season_id',
    comment: '所属赛季ID'
  },
  matchType: {
    type: DataTypes.ENUM('internal', 'external'),
    defaultValue: 'internal',
    field: 'match_type',
    comment: '比赛类型（internal=内战，external=外战）'
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
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'matches',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['match_date'] },
    { fields: ['status'] },
    { fields: ['team1_id'] },
    { fields: ['team2_id'] },
    { fields: ['season_id'] },
    { fields: ['match_type'] }
  ]
});

module.exports = Match;
