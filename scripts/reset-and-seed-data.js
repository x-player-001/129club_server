const sequelize = require('../src/config/database');
const { User } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function resetAndSeedData() {
  try {
    console.log('开始清空数据...');

    // 清空比赛相关数据
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    await sequelize.query('TRUNCATE TABLE match_participants');
    await sequelize.query('TRUNCATE TABLE match_quarters');
    await sequelize.query('TRUNCATE TABLE match_events');
    await sequelize.query('TRUNCATE TABLE match_results');
    await sequelize.query('TRUNCATE TABLE lineups');
    await sequelize.query('TRUNCATE TABLE registrations');
    await sequelize.query('TRUNCATE TABLE matches');

    // 清空成就和通知数据
    await sequelize.query('TRUNCATE TABLE user_achievements');
    await sequelize.query('TRUNCATE TABLE notifications');

    // 清空统计数据
    await sequelize.query('TRUNCATE TABLE player_stats');
    await sequelize.query('TRUNCATE TABLE player_team_stats');
    await sequelize.query('TRUNCATE TABLE team_stats');

    // 清空队伍相关数据
    await sequelize.query('TRUNCATE TABLE team_members');
    await sequelize.query('TRUNCATE TABLE draft_picks');
    await sequelize.query('TRUNCATE TABLE team_reshuffles');
    await sequelize.query('TRUNCATE TABLE teams');

    // 清空人员数据
    await sequelize.query('TRUNCATE TABLE users');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ 数据清空完成');

    console.log('\n开始插入人员数据...');

    // 插入真实的人员数据
    const users = [
      {
        id: uuidv4(),
        openid: 'test_user_001',
        nickname: '张伟',
        realName: '张伟',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138001',
        jerseyNumber: 7,
        position: ['前锋'],
        role: 'super_admin',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_002',
        nickname: '李强',
        realName: '李强',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138002',
        jerseyNumber: 10,
        position: ['中场'],
        role: 'captain',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_003',
        nickname: '王磊',
        realName: '王磊',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138003',
        jerseyNumber: 5,
        position: ['后卫'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_004',
        nickname: '刘洋',
        realName: '刘洋',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138004',
        jerseyNumber: 1,
        position: ['守门员'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_005',
        nickname: '陈浩',
        realName: '陈浩',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138005',
        jerseyNumber: 9,
        position: ['前锋'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_006',
        nickname: '赵明',
        realName: '赵明',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138006',
        jerseyNumber: 8,
        position: ['中场', '前锋'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_007',
        nickname: '周杰',
        realName: '周杰',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138007',
        jerseyNumber: 6,
        position: ['后卫', '中场'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_008',
        nickname: '吴涛',
        realName: '吴涛',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138008',
        jerseyNumber: 11,
        position: ['前锋'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_009',
        nickname: '孙鹏',
        realName: '孙鹏',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138009',
        jerseyNumber: 3,
        position: ['后卫'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_010',
        nickname: '郑凯',
        realName: '郑凯',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138010',
        jerseyNumber: 4,
        position: ['后卫'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_011',
        nickname: '冯军',
        realName: '冯军',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138011',
        jerseyNumber: 2,
        position: ['后卫'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_012',
        nickname: '许辉',
        realName: '许辉',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138012',
        jerseyNumber: 15,
        position: ['中场'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_013',
        nickname: '何斌',
        realName: '何斌',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138013',
        jerseyNumber: 14,
        position: ['中场', '后卫'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_014',
        nickname: '吕超',
        realName: '吕超',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138014',
        jerseyNumber: 17,
        position: ['前锋'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_015',
        nickname: '丁勇',
        realName: '丁勇',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138015',
        jerseyNumber: 12,
        position: ['守门员'],
        role: 'member',
        memberType: 'temporary',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_016',
        nickname: '任飞',
        realName: '任飞',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138016',
        jerseyNumber: 18,
        position: ['中场'],
        role: 'member',
        memberType: 'temporary',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_017',
        nickname: '姜华',
        realName: '姜华',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138017',
        jerseyNumber: 19,
        position: ['前锋', '中场'],
        role: 'member',
        memberType: 'temporary',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_018',
        nickname: '崔建',
        realName: '崔建',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138018',
        jerseyNumber: 20,
        position: ['后卫'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_019',
        nickname: '谭斌',
        realName: '谭斌',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138019',
        jerseyNumber: 13,
        position: ['中场'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      },
      {
        id: uuidv4(),
        openid: 'test_user_020',
        nickname: '邹涛',
        realName: '邹涛',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKicNiaKxEwUDv5ibibHiaice8tG9INf5sA8k5RicP7xJRdNVhvQxvjUicXPh0YPh0LibZJcXEz3LOnvjq6Akg/132',
        phone: '13800138020',
        jerseyNumber: 16,
        position: ['前锋'],
        role: 'member',
        memberType: 'regular',
        status: 'active'
      }
    ];

    await User.bulkCreate(users);

    console.log(`✅ 成功插入 ${users.length} 条人员数据`);
    console.log('\n人员列表:');
    users.forEach((user, index) => {
      const positions = Array.isArray(user.position) ? user.position : JSON.parse(user.position);
      console.log(`${index + 1}. ${user.realName} (${user.nickname}) - 球衣号: ${user.jerseyNumber} - 位置: ${positions.join('/')} - 类型: ${user.memberType}`);
    });

    console.log('\n✅ 所有数据重置完成！');
    process.exit(0);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

resetAndSeedData();
