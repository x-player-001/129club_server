const { User } = require('../src/models');

async function verifyData() {
  const users = await User.findAll({
    attributes: ['nickname', 'position', 'leftFootSkill', 'rightFootSkill'],
    limit: 10,
    raw: true
  });

  console.log('✅ 更新后的数据示例:\n');

  users.forEach(u => {
    console.log(`${u.nickname}:`);
    console.log(`  位置: ${u.position}`);
    console.log(`  左脚: ${u.leftFootSkill}, 右脚: ${u.rightFootSkill}`);
    console.log('');
  });

  process.exit(0);
}

verifyData();
