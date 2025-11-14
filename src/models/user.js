const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '用户ID (UUID)'
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '微信openid'
  },
  unionid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '微信unionid'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '昵称'
  },
  realName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'real_name',
    comment: '真实姓名'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  jerseyNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'jersey_number',
    comment: '球衣号码'
  },
  position: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '场上位置编码JSON数组 (支持多选, 如 ["CAM","LW","ST"])',
    get() {
      const value = this.getDataValue('position');
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch (e) {
        // 兼容旧数据：如果是单个字符串，转换为数组
        return [value];
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('position', JSON.stringify(value));
      } else if (typeof value === 'string') {
        // 如果传入字符串，转换为数组
        this.setDataValue('position', JSON.stringify([value]));
      } else {
        this.setDataValue('position', JSON.stringify([]));
      }
    }
  },
  leftFootSkill: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    field: 'left_foot_skill',
    comment: '左脚擅长程度(0-5, 0=不会, 5=非常擅长)',
    validate: {
      min: 0,
      max: 5
    }
  },
  rightFootSkill: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    field: 'right_foot_skill',
    comment: '右脚擅长程度(0-5, 0=不会, 5=非常擅长)',
    validate: {
      min: 0,
      max: 5
    }
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'captain', 'member'),
    defaultValue: 'member',
    comment: '角色'
  },
  memberType: {
    type: DataTypes.ENUM('regular', 'temporary'),
    defaultValue: 'temporary',
    field: 'member_type',
    comment: '队员类型（regular=正式队员, temporary=临时队员）'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'leave'),
    defaultValue: 'active',
    comment: '状态'
  },
  currentTeamId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'current_team_id',
    comment: '当前队伍ID'
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'join_date',
    comment: '加入日期'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['openid'] },
    { fields: ['status'] },
    { fields: ['current_team_id'] }
  ]
});

module.exports = User;
