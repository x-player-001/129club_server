const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '队伍ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '队名'
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '队徽URL'
  },
  captainId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'captain_id',
    comment: '队长ID'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '队伍主色调'
  },
  jerseyImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'jersey_image',
    comment: '球衣图片URL'
  },
  season: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'season_id',
    comment: '赛季ID'
  },
  status: {
    type: DataTypes.ENUM('active', 'disbanded', 'archived'),
    defaultValue: 'active',
    comment: '状态'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  },
  disbandedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'disbanded_at',
    comment: '解散时间'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    comment: '创建者ID'
  }
}, {
  tableName: 'teams',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['season'] },
    { fields: ['status'] },
    { fields: ['captain_id'] }
  ]
});

module.exports = Team;
