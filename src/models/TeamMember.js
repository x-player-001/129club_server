const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '关系ID'
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
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'joined_at',
    comment: '加入时间'
  },
  role: {
    type: DataTypes.ENUM('captain', 'member'),
    defaultValue: 'member',
    comment: '队内角色'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: '是否在队'
  }
}, {
  tableName: 'team_members',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['team_id'] },
    { fields: ['user_id'] },
    { fields: ['is_active'] }
  ]
});

module.exports = TeamMember;
