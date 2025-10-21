const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DraftPick = sequelize.define('DraftPick', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '选人记录ID'
  },
  reshuffleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'reshuffle_id',
    comment: '重组ID'
  },
  round: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '轮次'
  },
  pickOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'pick_order',
    comment: '选人顺序'
  },
  captainId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'captain_id',
    comment: '队长ID'
  },
  pickedUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'picked_user_id',
    comment: '被选中的用户ID'
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'team_id',
    comment: '队伍ID'
  },
  pickedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'picked_at',
    comment: '选择时间'
  }
}, {
  tableName: 'draft_picks',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['reshuffle_id'] },
    { fields: ['round'] }
  ]
});

module.exports = DraftPick;
