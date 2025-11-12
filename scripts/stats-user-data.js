const { User } = require('../src/models');

async function statsData() {
  const users = await User.findAll({
    attributes: ['position', 'leftFootSkill', 'rightFootSkill'],
    raw: true
  });

  console.log('📊 数据统计报告\n');

  // 统计位置分布
  const positionStats = {};
  users.forEach(u => {
    const positions = typeof u.position === 'string' ? JSON.parse(u.position) : u.position;
    positions.forEach(pos => {
      positionStats[pos] = (positionStats[pos] || 0) + 1;
    });
  });

  console.log('位置分布:');
  Object.entries(positionStats).sort((a, b) => b[1] - a[1]).forEach(([pos, count]) => {
    console.log(`  ${pos}: ${count} 人`);
  });

  // 统计左脚擅长程度分布
  const leftFootStats = {};
  users.forEach(u => {
    leftFootStats[u.leftFootSkill] = (leftFootStats[u.leftFootSkill] || 0) + 1;
  });

  console.log('\n左脚擅长程度分布:');
  [0, 1, 2, 3, 4, 5].forEach(level => {
    const count = leftFootStats[level] || 0;
    console.log(`  ${level}: ${count} 人`);
  });

  // 统计右脚擅长程度分布
  const rightFootStats = {};
  users.forEach(u => {
    rightFootStats[u.rightFootSkill] = (rightFootStats[u.rightFootSkill] || 0) + 1;
  });

  console.log('\n右脚擅长程度分布:');
  [0, 1, 2, 3, 4, 5].forEach(level => {
    const count = rightFootStats[level] || 0;
    console.log(`  ${level}: ${count} 人`);
  });

  console.log(`\n总用户数: ${users.length}`);

  process.exit(0);
}

statsData();
