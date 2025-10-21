const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '权限ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '资源名称'
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '操作类型 create/read/update/delete'
  },
  grantedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'granted_at',
    comment: '授权时间'
  },
  grantedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'granted_by',
    comment: '授权人ID'
  }
}, {
  tableName: 'permissions',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['resource'] }
  ]
});

module.exports = Permission;
