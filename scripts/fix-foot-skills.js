/**
 * 修复惯用脚数据
 * 确保每个用户至少有一只脚的擅长程度是5
 */

const { User } = require('../src/models');

async function fixFootSkills() {
  try {
    console.log('🚀 开始修复惯用脚数据...\n');

    // 获取所有用户
    const users = await User.findAll();
    console.log(`📊 找到 ${users.length} 个用户\n`);

    let fixedCount = 0;
    let alreadyOkCount = 0;

    for (const user of users) {
      const leftSkill = user.leftFootSkill || 0;
      const rightSkill = user.rightFootSkill || 0;

      // 如果两只脚都不是5,需要修复
      if (leftSkill !== 5 && rightSkill !== 5) {
        // 随机选择一只脚设置为5
        const setLeftTo5 = Math.random() < 0.5;

        if (setLeftTo5) {
          await user.update({ leftFootSkill: 5 });
          console.log(`✅ ${user.nickname || user.id}`);
          console.log(`   左脚: ${leftSkill} → 5, 右脚: ${rightSkill}`);
        } else {
          await user.update({ rightFootSkill: 5 });
          console.log(`✅ ${user.nickname || user.id}`);
          console.log(`   左脚: ${leftSkill}, 右脚: ${rightSkill} → 5`);
        }
        console.log('');
        fixedCount++;
      } else {
        // 已经满足条件
        alreadyOkCount++;
        console.log(`✓ ${user.nickname || user.id} (左脚:${leftSkill}, 右脚:${rightSkill})`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 修复完成!');
    console.log(`   已修复: ${fixedCount} 个用户`);
    console.log(`   已满足: ${alreadyOkCount} 个用户`);
    console.log('='.repeat(50));

    // 验证结果
    console.log('\n验证结果:');
    const allUsers = await User.findAll({
      attributes: ['nickname', 'leftFootSkill', 'rightFootSkill'],
      raw: true
    });

    const invalidUsers = allUsers.filter(u =>
      (u.leftFootSkill || 0) !== 5 && (u.rightFootSkill || 0) !== 5
    );

    if (invalidUsers.length === 0) {
      console.log('✅ 所有用户都至少有一只脚的擅长程度为5');
    } else {
      console.log(`❌ 还有 ${invalidUsers.length} 个用户不满足条件`);
      invalidUsers.forEach(u => {
        console.log(`  ${u.nickname}: 左脚=${u.leftFootSkill}, 右脚=${u.rightFootSkill}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  }
}

// 执行修复
fixFootSkills();
