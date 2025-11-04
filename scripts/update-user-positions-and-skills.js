/**
 * 更新用户位置和擅长脚数据
 * 1. 将position字段从汉字转换为英文编码
 * 2. 随机更新leftFootSkill和rightFootSkill
 */

const { User } = require('../src/models');

// 位置映射：汉字 -> 英文编码
const positionMapping = {
  '门将': ['GK'],
  '后卫': ['CB', 'LB', 'RB'],
  '左后卫': ['LB'],
  '右后卫': ['RB'],
  '中后卫': ['CB'],
  '边后卫': ['LB', 'RB'],
  '中场': ['CM', 'CDM', 'CAM'],
  '后腰': ['CDM'],
  '前腰': ['CAM'],
  '中前卫': ['CM'],
  '边前卫': ['LM', 'RM'],
  '左边前卫': ['LM'],
  '右边前卫': ['RM'],
  '前锋': ['ST', 'CF', 'LW', 'RW'],
  '中锋': ['ST', 'CF'],
  '边锋': ['LW', 'RW'],
  '左边锋': ['LW'],
  '右边锋': ['RW']
};

/**
 * 将汉字位置转换为英文编码
 */
function convertPositionToCode(chinesePositions) {
  if (!chinesePositions || chinesePositions.length === 0) {
    // 如果没有位置，随机分配一个
    const allPositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'ST', 'CF', 'LW', 'RW'];
    return [allPositions[Math.floor(Math.random() * allPositions.length)]];
  }

  const codes = new Set();

  chinesePositions.forEach(chinesePos => {
    const mappedCodes = positionMapping[chinesePos];
    if (mappedCodes && mappedCodes.length > 0) {
      // 从映射的编码中随机选择一个
      const randomCode = mappedCodes[Math.floor(Math.random() * mappedCodes.length)];
      codes.add(randomCode);
    }
  });

  // 如果没有匹配到任何编码，返回一个默认值
  if (codes.size === 0) {
    codes.add('CM'); // 默认中前卫
  }

  return Array.from(codes);
}

/**
 * 生成随机的擅长程度 (0-5)
 */
function randomSkill() {
  // 权重分布: 0(5%), 1(10%), 2(15%), 3(35%), 4(25%), 5(10%)
  const rand = Math.random();
  if (rand < 0.05) return 0;
  if (rand < 0.15) return 1;
  if (rand < 0.30) return 2;
  if (rand < 0.65) return 3;
  if (rand < 0.90) return 4;
  return 5;
}

async function updateUsersData() {
  try {
    console.log('🚀 开始更新用户数据...\n');

    // 获取所有用户
    const users = await User.findAll();
    console.log(`📊 找到 ${users.length} 个用户\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const oldPosition = user.position;

        // 转换位置编码
        const newPosition = convertPositionToCode(oldPosition);

        // 生成随机擅长脚数值
        const leftFootSkill = randomSkill();
        const rightFootSkill = randomSkill();

        // 更新用户数据
        await user.update({
          position: newPosition,
          leftFootSkill,
          rightFootSkill
        });

        console.log(`✅ ${user.nickname || user.id}`);
        console.log(`   位置: ${JSON.stringify(oldPosition)} -> ${JSON.stringify(newPosition)}`);
        console.log(`   左脚: ${leftFootSkill}, 右脚: ${rightFootSkill}`);
        console.log('');

        successCount++;
      } catch (err) {
        console.error(`❌ 更新失败 (${user.nickname || user.id}):`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ 更新完成!`);
    console.log(`   成功: ${successCount} 个用户`);
    console.log(`   失败: ${errorCount} 个用户`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  }
}

// 执行更新
updateUsersData();
