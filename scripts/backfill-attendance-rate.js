/**
 * 回填球员出勤率数据
 * 按队伍计算：出勤率 = 球员参赛场次 / 队伍总比赛数 × 100
 */

const { PlayerStat, User, Match } = require('../src/models');
const { Op } = require('sequelize');

async function backfillAttendanceRate() {
  try {
    console.log('🚀 开始回填球员出勤率数据...\n');

    // 获取所有球员统计数据
    const playerStats = await PlayerStat.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'currentTeamId'],
        required: true
      }]
    });

    console.log(`📊 找到 ${playerStats.length} 个球员统计记录\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let noTeamCount = 0;

    for (const stat of playerStats) {
      const user = stat.user;

      if (!user.currentTeamId) {
        console.log(`⚠️  ${user.nickname}: 没有所属队伍，跳过`);
        noTeamCount++;
        continue;
      }

      if (stat.matchesPlayed === 0) {
        console.log(`⚠️  ${user.nickname}: 参赛场次为0，跳过`);
        skippedCount++;
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
        skippedCount++;
        continue;
      }

      // 计算出勤率
      const attendanceRate = ((stat.matchesPlayed / teamMatchCount) * 100).toFixed(2);
      const oldRate = stat.attendanceRate;

      // 更新出勤率
      await stat.update({ attendanceRate });

      console.log(`✅ ${user.nickname}`);
      console.log(`   参赛: ${stat.matchesPlayed}场 / 队伍总计: ${teamMatchCount}场`);
      console.log(`   出勤率: ${oldRate}% → ${attendanceRate}%`);
      console.log('');

      updatedCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 回填完成!');
    console.log(`   已更新: ${updatedCount} 个球员`);
    console.log(`   已跳过: ${skippedCount} 个球员`);
    console.log(`   无队伍: ${noTeamCount} 个球员`);
    console.log('='.repeat(50));

    // 验证结果
    console.log('\n📊 验证结果:');
    const verifyStats = await PlayerStat.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['nickname', 'currentTeamId']
      }],
      where: {
        matchesPlayed: { [Op.gt]: 0 }
      },
      order: [['attendanceRate', 'DESC']],
      limit: 5
    });

    console.log('\n出勤率最高的5位球员:');
    verifyStats.forEach(s => {
      console.log(`  ${s.user.nickname}: ${s.attendanceRate}% (${s.matchesPlayed}场)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  }
}

// 执行回填
backfillAttendanceRate();
