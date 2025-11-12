const { Registration, MatchParticipant, User } = require('../src/models');

async function checkData() {
  try {
    console.log('📊 检查报名与到场数据\n');

    // 获取所有用户
    const users = await User.findAll({
      attributes: ['id', 'nickname'],
      limit: 5
    });

    for (const user of users) {
      // 统计报名次数
      const registrationCount = await Registration.count({
        where: { userId: user.id }
      });

      // 统计实际到场次数
      const participantCount = await MatchParticipant.count({
        where: { userId: user.id }
      });

      console.log(`${user.nickname}:`);
      console.log(`  报名次数: ${registrationCount}`);
      console.log(`  到场次数: ${participantCount}`);

      if (registrationCount > 0) {
        const rate = ((participantCount / registrationCount) * 100).toFixed(2);
        console.log(`  出勤率: ${rate}%`);
      }
      console.log('');
    }

    // 总体统计
    const totalRegistrations = await Registration.count();
    const totalParticipants = await MatchParticipant.count();

    console.log('总体统计:');
    console.log(`  总报名: ${totalRegistrations} 人次`);
    console.log(`  总到场: ${totalParticipants} 人次`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkData();
