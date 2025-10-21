const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lineup = sequelize.define('Lineup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '阵容ID'
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
  position: {
    type: DataTypes.ENUM('GK', 'DF', 'MF', 'FW', 'SUB'),
    allowNull: false,
    comment: '场上位置'
  },
  jerseyNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'jersey_number',
    comment: '球衣号码'
  },
  isStarter: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_starter',
    comment: '是否首发'
  },
  setBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'set_by',
    comment: '设置者ID（队长）'
  },
  setAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'set_at',
    comment: '设置时间'
  }
}, {
  tableName: 'lineups',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['match_id', 'team_id', 'user_id'],
      unique: true,
      name: 'uk_match_team_user'
    },
    { fields: ['match_id'] },
    { fields: ['team_id'] }
  ]
});

module.exports = Lineup;
