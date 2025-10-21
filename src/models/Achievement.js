const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Achievement ID'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Achievement code, e.g. hat_trick'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Achievement name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Achievement description'
  },
  icon: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Icon emoji or URL'
  },
  type: {
    type: DataTypes.ENUM('single_match', 'cumulative', 'streak'),
    allowNull: false,
    defaultValue: 'single_match',
    comment: 'Achievement type: single_match, cumulative, streak'
  },
  condition: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Achievement condition in JSON format'
  },
  isSeasonBound: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_season_bound',
    comment: 'Whether the achievement is bound to a season'
  },
  isRepeatable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_repeatable',
    comment: 'Whether the achievement can be unlocked multiple times'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    comment: 'Display order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Whether the achievement is active'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: 'Created time'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: 'Updated time'
  }
}, {
  tableName: 'achievements',
  timestamps: false,
  underscored: true
});

module.exports = Achievement;
