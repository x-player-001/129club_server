const axios = require('axios');
const { Op } = require('sequelize');
const config = require('../config');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { User, Team, TeamMember, PlayerStat } = require('../models');

/**
 * 用户登录
 * @param {string} code 微信登录code
 * @param {Object} userInfo 用户信息（昵称、头像等）
 */
exports.login = async (code, userInfo = {}) => {
  try {
    let openid, unionid;

    // 开发环境：如果code是test开头，使用模拟登录
    if (config.env === 'development' && code.startsWith('test_')) {
      // 模拟登录模式（仅用于测试）
      openid = code;
      logger.info(`Development mode: Mock login with openid=${openid}`);
    } else {
      // 调用微信接口获取openid
      const wxUrl = config.wechat.loginUrl;
      const params = {
        appid: config.wechat.appid,
        secret: config.wechat.secret,
        js_code: code,
        grant_type: 'authorization_code'
      };

      logger.info(`Calling WeChat API: ${wxUrl}`, {
        appid: params.appid,
        hasSecret: !!params.secret,
        secretLength: params.secret?.length
      });

      try {
        const response = await axios.get(wxUrl, {
          params,
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          // 禁用代理，直接连接
          proxy: false,
          // 忽略 SSL 证书错误（仅开发环境）
          httpsAgent: config.env === 'development' ? new (require('https').Agent)({
            rejectUnauthorized: false
          }) : undefined
        });

        logger.info('WeChat API response:', response.data);

        const { openid: wxOpenid, unionid: wxUnionid, errcode, errmsg } = response.data;

        // 检查微信API返回的错误码
        if (errcode) {
          logger.error(`WeChat API error: ${errcode} - ${errmsg}`);
          throw new Error(`微信登录失败 [${errcode}]: ${errmsg || '未知错误'}`);
        }

        if (!wxOpenid) {
          logger.error('WeChat API returned no openid');
          throw new Error('微信登录失败: 未获取到openid');
        }

        openid = wxOpenid;
        unionid = wxUnionid;
      } catch (wxError) {
        // 处理网络错误或HTTP错误
        if (wxError.response) {
          // HTTP错误响应 (4xx, 5xx)
          const status = wxError.response.status;
          const responseData = wxError.response.data;
          logger.error(`WeChat API HTTP error ${status}:`, {
            status: status,
            statusText: wxError.response.statusText,
            data: responseData,
            headers: wxError.response.headers
          });

          // 如果响应包含数据，尝试解析
          let errorDetail = `HTTP ${status}`;
          if (responseData) {
            if (typeof responseData === 'string') {
              errorDetail = `HTTP ${status}: ${responseData.substring(0, 100)}`;
            } else if (responseData.errcode) {
              errorDetail = `errcode ${responseData.errcode}: ${responseData.errmsg || '未知错误'}`;
            }
          }

          throw new Error(`微信接口调用失败 [${errorDetail}]: 微信服务暂时不可用，请稍后重试`);
        } else if (wxError.request) {
          // 请求已发送但没有收到响应
          logger.error('WeChat API no response:', wxError.message);
          throw new Error('微信接口调用超时: 网络连接失败，请检查网络后重试');
        } else {
          // 其他错误（包括微信返回的业务错误）
          throw wxError;
        }
      }
    }

    // 查询或创建用户
    const defaults = {
      openid,
      unionid,
      status: 'active'
    };

    // 只有前端传了才设置，否则保持为空
    if (userInfo.nickname) {
      defaults.nickname = userInfo.nickname;
    }
    if (userInfo.avatar) {
      defaults.avatar = userInfo.avatar;
    }

    let [user, created] = await User.findOrCreate({
      where: { openid },
      defaults
    });

    // 如果用户已存在，更新基本信息
    if (!created && userInfo.nickname) {
      await user.update({
        nickname: userInfo.nickname,
        avatar: userInfo.avatar || user.avatar
      });
    }

    // 生成JWT token
    const token = generateToken({
      id: user.id,
      openid: user.openid,
      role: user.role
    });

    logger.info(`User login success: ${user.id}, created: ${created}, openid: ${openid}`);

    return {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        realName: user.realName,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        currentTeamId: user.currentTeamId,
        jerseyNumber: user.jerseyNumber,
        position: user.position,
        isNewUser: created
      }
    };
  } catch (error) {
    logger.error('Login error:', error.message, error.stack);
    throw error;
  }
};

/**
 * 获取用户信息
 * @param {string} userId 用户ID
 */
exports.getUserInfo = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['openid', 'unionid'] },
    include: [
      {
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'logo', 'color'],
        foreignKey: 'currentTeamId',
        required: false
      },
      {
        model: PlayerStat,
        as: 'stats',
        required: false
      }
    ]
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return user;
};

/**
 * 更新用户信息
 * @param {string} userId 用户ID
 * @param {Object} data 更新数据
 */
exports.updateUserInfo = async (userId, data) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 只允许更新特定字段
  const allowedFields = [
    'nickname', 'realName', 'avatar', 'phone',
    'jerseyNumber', 'position', 'memberType'
  ];

  const updateData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  await user.update(updateData);

  logger.info(`User info updated: ${userId}`, updateData);

  return user;
};

/**
 * 获取成员列表
 * @param {Object} params 查询参数
 */
exports.getMemberList = async (params = {}) => {
  const {
    page = 1,
    pageSize = 20,
    status,
    teamId,
    role,
    position,
    keyword
  } = params;

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  // 构建查询条件
  const where = {};

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role;
  }

  if (position) {
    // 支持多选位置查询：检查JSON数组中是否包含指定位置
    where.position = { [Op.like]: `%"${position}"%` };
  }

  if (teamId) {
    where.currentTeamId = teamId;
  }

  if (keyword) {
    where[Op.or] = [
      { nickname: { [Op.like]: `%${keyword}%` } },
      { realName: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['openid', 'unionid'] },
    include: [
      {
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'logo'],
        foreignKey: 'currentTeamId',
        required: false
      },
      {
        model: PlayerStat,
        as: 'stats',
        attributes: ['matchesPlayed', 'goals', 'assists', 'winRate'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });

  return {
    list: rows,
    total: count,
    page: parseInt(page),
    pageSize: limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * 获取成员详情
 * @param {string} userId 用户ID
 */
exports.getMemberDetail = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['openid', 'unionid'] },
    include: [
      {
        model: Team,
        as: 'currentTeam',
        attributes: ['id', 'name', 'logo', 'color'],
        foreignKey: 'currentTeamId',
        required: false
      },
      {
        model: PlayerStat,
        as: 'stats',
        required: false
      },
      {
        model: TeamMember,
        as: 'teamMemberships',
        where: { isActive: true },
        required: false,
        include: [
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'season']
          }
        ]
      }
    ]
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return user;
};
