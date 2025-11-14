const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserVisitLog = sequelize.define('UserVisitLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '日志ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  visitTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'visit_time',
    comment: '访问时间'
  },
  visitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'visit_date',
    comment: '访问日期'
  },
  platform: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '平台（iOS/Android/devtools）'
  },
  appVersion: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'app_version',
    comment: '小程序版本号'
  },
  scene: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '场景值（从哪里进入小程序）'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ip_address',
    comment: 'IP地址'
  },
  deviceModel: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'device_model',
    comment: '设备型号'
  },
  systemVersion: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'system_version',
    comment: '操作系统版本'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  }
}, {
  tableName: 'user_visit_logs',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['visit_date'] },
    { fields: ['visit_time'] }
  ]
});

module.exports = UserVisitLog;
