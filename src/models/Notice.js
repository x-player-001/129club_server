const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '公告ID'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '内容'
  },
  type: {
    type: DataTypes.ENUM('announcement', 'match', 'team', 'system'),
    defaultValue: 'announcement',
    comment: '类型'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    comment: '优先级'
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_pinned',
    comment: '是否置顶'
  },
  publisherId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'publisher_id',
    comment: '发布者ID'
  },
  publishedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'published_at',
    comment: '发布时间'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at',
    comment: '过期时间'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count',
    comment: '查看次数'
  }
}, {
  tableName: 'notices',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['published_at'] },
    { fields: ['is_pinned'] }
  ]
});

module.exports = Notice;
