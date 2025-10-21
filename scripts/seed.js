require('dotenv').config();
const { User, Team, TeamMember, PlayerStat } = require('../src/models');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    console.log('🌱 开始填充测试数据...');

    // 创建超级管理员
    const admin = await User.create({
      openid: 'test_admin_openid',
      nickname: '球队管理员',
      realName: '张三',
      role: 'super_admin',
      status: 'active',
      jerseyNumber: 1,
      position: 'MF',
      joinDate: new Date()
    });
    console.log('✅ 创建管理员:', admin.nickname);

    // 创建两个队长
    const captain1 = await User.create({
      openid: 'test_captain1_openid',
      nickname: '红队队长',
      realName: '李四',
      role: 'captain',
      status: 'active',
      jerseyNumber: 10,
      position: 'FW',
      joinDate: new Date()
    });
    console.log('✅ 创建队长1:', captain1.nickname);

    const captain2 = await User.create({
      openid: 'test_captain2_openid',
      nickname: '蓝队队长',
      realName: '王五',
      role: 'captain',
      status: 'active',
      jerseyNumber: 9,
      position: 'FW',
      joinDate: new Date()
    });
    console.log('✅ 创建队长2:', captain2.nickname);

    // 创建普通成员
    const members = [];
    for (let i = 1; i <= 10; i++) {
      const positions = ['GK', 'DF', 'MF', 'FW'];
      const position = positions[Math.floor(Math.random() * positions.length)];

      const member = await User.create({
        openid: `test_member_${i}_openid`,
        nickname: `球员${i}`,
        realName: `成员${i}`,
        role: 'member',
        status: 'active',
        jerseyNumber: i + 10,
        position,
        joinDate: new Date()
      });
      members.push(member);
    }
    console.log(`✅ 创建了 ${members.length} 个普通成员`);

    // 创建队伍
    const team1 = await Team.create({
      name: '红队',
      captainId: captain1.id,
      color: '#FF0000',
      season: '2025-S1',
      status: 'active',
      createdBy: admin.id
    });
    console.log('✅ 创建队伍:', team1.name);

    const team2 = await Team.create({
      name: '蓝队',
      captainId: captain2.id,
      color: '#0000FF',
      season: '2025-S1',
      status: 'active',
      createdBy: admin.id
    });
    console.log('✅ 创建队伍:', team2.name);

    // 分配成员到队伍
    await captain1.update({ currentTeamId: team1.id });
    await captain2.update({ currentTeamId: team2.id });

    await TeamMember.create({
      teamId: team1.id,
      userId: captain1.id,
      role: 'captain',
      isActive: true
    });

    await TeamMember.create({
      teamId: team2.id,
      userId: captain2.id,
      role: 'captain',
      isActive: true
    });

    // 将普通成员分配到两个队伍
    for (let i = 0; i < members.length; i++) {
      const team = i % 2 === 0 ? team1 : team2;
      await members[i].update({ currentTeamId: team.id });

      await TeamMember.create({
        teamId: team.id,
        userId: members[i].id,
        role: 'member',
        isActive: true
      });
    }
    console.log('✅ 成员已分配到队伍');

    // 创建初始统计数据
    const allUsers = [admin, captain1, captain2, ...members];
    for (const user of allUsers) {
      await PlayerStat.create({
        userId: user.id,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        mvpCount: 0,
        attendanceRate: 0,
        winRate: 0
      });
    }
    console.log('✅ 创建初始统计数据');

    console.log('\n✅ 测试数据填充完成！');
    console.log('\n📊 数据汇总：');
    console.log(`   - 用户总数: ${allUsers.length}`);
    console.log(`   - 管理员: 1`);
    console.log(`   - 队长: 2`);
    console.log(`   - 普通成员: ${members.length}`);
    console.log(`   - 队伍数: 2`);
    console.log(`   - 红队人数: ${(members.length / 2) + 1}`);
    console.log(`   - 蓝队人数: ${(members.length / 2) + 1}`);

  } catch (error) {
    console.error('❌ 填充数据失败：', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
