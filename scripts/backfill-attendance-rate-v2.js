/**
 * 回填球员出勤率数据 V2
 * 出勤率 = 球员到场次数 / 队伍总比赛数 × 100
 *
 * 包括：
 * 1. 更新有PlayerStat记录的球员
 * 2. 为报名过但从未到场的球员创建PlayerStat记录（出勤率=0）
 */

const { PlayerStat, User, Match, Registration, MatchParticipant } = require('../src/models');
const { Op } = require('sequelize');

async function backfillAttendanceRateV2() {
  try {
    console.log('🚀 开始回填球员出勤率数据 V2...\n');

    // 步骤1: 更新所有已有PlayerStat记录的球员
    console.log('【步骤1】更新已有PlayerStat记录的球员\n');

    const existingStats = await PlayerStat.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'currentTeamId']
      }]
    });

    console.log(`找到 ${existingStats.length} 个已有记录\n`);

    let updatedCount = 0;

    for (const stat of existingStats) {
      const user = stat.user;

      if (!user || !user.currentTeamId) {
        console.log(`⚠️  ${user?.nickname || 'Unknown'}: 没有所属队伍，跳过`);
        continue;
      }

      // 统计该队伍参加的已完成比赛总数
      const teamMatchCount = await Match.count({
        where: {
          status: 'completed',
          [Op.or]: [
            { team1Id: user.currentTeamId },
            { team2Id: user.currentTeamId }
          ]
        }
      });

      if (teamMatchCount === 0) {
        console.log(`⚠️  ${user.nickname}: 队伍没有已完成的比赛`);
        continue;
      }

      // 计算出勤率 = 到场次数 / 队伍比赛数 × 100
      const attendanceRate = ((stat.matchesPlayed / teamMatchCount) * 100).toFixed(2);
      const oldRate = stat.attendanceRate;

      await stat.update({ attendanceRate });

      console.log(`✅ ${user.nickname}`);
      console.log(`   到场: ${stat.matchesPlayed}场 / 队伍: ${teamMatchCount}场`);
      console.log(`   出勤率: ${oldRate}% → ${attendanceRate}%`);
      console.log('');

      updatedCount++;
    }

    console.log(`✅ 已更新 ${updatedCount} 个球员\n`);

    // 步骤2: 为报名过但从未到场的球员创建PlayerStat记录
    console.log('\n【步骤2】为报名过但从未到场的球员创建记录\n');

    // 获取所有报名过的用户ID
    const registeredUserIds = await Registration.findAll({
      attributes: ['userId'],
      group: ['userId'],
      raw: true
    });

    const registeredUserIdSet = new Set(registeredUserIds.map(r => r.userId));
    console.log(`共有 ${registeredUserIdSet.size} 个用户报名过比赛\n`);

    // 获取所有已有PlayerStat的用户ID
    const existingUserIds = await PlayerStat.findAll({
      attributes: ['userId'],
      raw: true
    });

    const existingUserIdSet = new Set(existingUserIds.map(s => s.userId));

    // 找出报名过但没有PlayerStat记录的用户
    const missingUserIds = [...registeredUserIdSet].filter(id => !existingUserIdSet.has(id));

    console.log(`找到 ${missingUserIds.length} 个用户报名过但没有PlayerStat记录\n`);

    let createdCount = 0;

    for (const userId of missingUserIds) {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'nickname', 'currentTeamId']
      });

      if (!user || !user.currentTeamId) {
        console.log(`⚠️  用户 ${userId}: 未找到或没有所属队伍，跳过`);
        continue;
      }

      // 统计该队伍参加的已完成比赛总数
      const teamMatchCount = await Match.count({
        where: {
          status: 'completed',
          [Op.or]: [
            { team1Id: user.currentTeamId },
            { team2Id: user.currentTeamId }
          ]
        }
      });

      if (teamMatchCount === 0) {
        console.log(`⚠️  ${user.nickname}: 队伍没有已完成的比赛，跳过`);
        continue;
      }

      // 创建PlayerStat记录，matchesPlayed=0, attendanceRate=0
      await PlayerStat.create({
        userId: user.id,
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winRate: '0.00',
        attendanceRate: '0.00',
        mvpCount: 0,
        yellowCards: 0,
        redCards: 0
      });

      console.log(`✅ ${user.nickname}`);
      console.log(`   创建记录: 到场 0场 / 队伍 ${teamMatchCount}场`);
      console.log(`   出勤率: 0.00%`);
      console.log('');

      createdCount++;
    }

    console.log(`✅ 已创建 ${createdCount} 个新记录\n`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ 回填完成!');
    console.log(`   已更新: ${updatedCount} 个球员`);
    console.log(`   已创建: ${createdCount} 个球员`);
    console.log('='.repeat(50));

    // 验证结果
    console.log('\n📊 验证结果:');
    const allStats = await PlayerStat.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['nickname']
      }],
      order: [['attendanceRate', 'DESC'], ['matchesPlayed', 'DESC']],
      limit: 10
    });

    console.log('\n出勤率前10位:');
    allStats.forEach((s, index) => {
      console.log(`  ${index + 1}. ${s.user.nickname}: ${s.attendanceRate}% (${s.matchesPlayed}场)`);
    });

    // 查找出勤率为0的球员
    const zeroAttendance = await PlayerStat.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['nickname']
      }],
      where: {
        attendanceRate: 0,
        matchesPlayed: 0
      }
    });

    if (zeroAttendance.length > 0) {
      console.log('\n出勤率为0的球员:');
      zeroAttendance.forEach(s => {
        console.log(`  ❌ ${s.user.nickname}: 0%`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行回填
backfillAttendanceRateV2();
