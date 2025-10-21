const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamReshuffle = sequelize.define('TeamReshuffle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '重组ID'
  },
  season: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '赛季'
  },
  initiatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'initiator_id',
    comment: '发起人ID'
  },
  captain1Id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'captain1_id',
    comment: '队长1 ID'
  },
  captain2Id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'captain2_id',
    comment: '队长2 ID'
  },
  team1Id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'team1_id',
    comment: '队伍1 ID'
  },
  team2Id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'team2_id',
    comment: '队伍2 ID'
  },
  status: {
    type: DataTypes.ENUM('draft_in_progress', 'completed', 'cancelled'),
    defaultValue: 'draft_in_progress',
    comment: '状态'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'started_at',
    comment: '开始时间'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
    comment: '完成时间'
  }
}, {
  tableName: 'team_reshuffles',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['season'] },
    { fields: ['status'] }
  ]
});

module.exports = TeamReshuffle;
