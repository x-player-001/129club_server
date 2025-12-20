const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 球员身价记录表
 * 记录每一笔身价变动的明细
 */
const PlayerValue = sequelize.define('PlayerValue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '记录ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: '球员ID'
  },
  clubYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'club_year',
    comment: '俱乐部年度（如12表示第12年）'
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'match_id',
    comment: '关联比赛ID（特殊奖励可能不关联比赛）'
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'season_id',
    comment: '关联赛季ID'
  },
  sourceType: {
    type: DataTypes.ENUM(
      'attendance',  // 出勤
      'role',        // 角色（守门/裁判）
      'result',      // 战绩（胜/平/MVP）
      'data',        // 数据（进球/助攻/零封）
      'service',     // 服务（家属/战报/照片/邀约）
      'special'      // 特殊奖励
    ),
    allowNull: false,
    field: 'source_type',
    comment: '身价来源类型'
  },
  sourceDetail: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'source_detail',
    comment: '详细描述（如"守门第2节"、"进球x2"）'
  },
  baseAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'base_amount',
    comment: '基础金额（万）'
  },
  multiplier: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    defaultValue: 1.0,
    comment: '倍率（1=内战，2=外战）'
  },
  finalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'final_amount',
    comment: '最终金额 = baseAmount × multiplier'
  },
  status: {
    type: DataTypes.ENUM('auto', 'pending', 'approved', 'rejected'),
    defaultValue: 'auto',
    comment: '状态（auto=自动计算, pending=待审核, approved=已审核, rejected=已驳回）'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by',
    comment: '审核人ID'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at',
    comment: '审核时间'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'player_values',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['club_year'] },
    { fields: ['match_id'] },
    { fields: ['source_type'] },
    { fields: ['status'] },
    { fields: ['user_id', 'club_year'] },
    { fields: ['user_id', 'match_id', 'source_type'] }
  ]
});

module.exports = PlayerValue;
