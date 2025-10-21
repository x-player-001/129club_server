const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Record ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: 'User ID'
  },
  achievementId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'achievement_id',
    comment: 'Achievement ID'
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'season_id',
    comment: 'Season ID (required if achievement is season-bound)'
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'unlocked_at',
    comment: 'Unlock time'
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'match_id',
    comment: 'Match ID that triggered the unlock'
  },
  unlockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'unlock_count',
    comment: 'Number of times unlocked (for repeatable achievements)'
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
  tableName: 'user_achievements',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'achievement_id', 'season_id'],
      name: 'unique_user_achievement_season'
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['achievement_id']
    }
  ]
});

module.exports = UserAchievement;
