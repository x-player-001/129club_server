const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Notification ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: 'User ID'
  },
  type: {
    type: DataTypes.ENUM('achievement', 'match', 'system'),
    allowNull: false,
    defaultValue: 'system',
    comment: 'Notification type'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Notification title'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notification content'
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Extra data in JSON format'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
    comment: 'Whether the notification has been read'
  },
  isShown: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_shown',
    comment: 'Whether the celebration animation has been shown'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: 'Created time'
  }
}, {
  tableName: 'notifications',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'is_read']
    },
    {
      fields: ['user_id', 'is_shown']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Notification;
