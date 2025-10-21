require('dotenv').config();
const { generateToken } = require('../src/utils/jwt');
const { User } = require('../src/models');

async function generateTestToken() {
  try {
    // 查找第一个用户
    const user = await User.findOne();

    if (!user) {
      console.error('❌ 没有找到用户，请先运行 npm run seed');
      process.exit(1);
    }

    // 生成token
    const token = generateToken({
      id: user.id,
      openid: user.openid,
      role: user.role
    });

    console.log('\n✅ Token生成成功！');
    console.log('\n用户信息:');
    console.log(`  ID: ${user.id}`);
    console.log(`  昵称: ${user.nickname}`);
    console.log(`  角色: ${user.role}`);
    console.log(`\nToken:\n${token}`);
    console.log('\n使用方法:');
    console.log(`  curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/user/info`);
    console.log(`\n或在test-api.http文件中替换 YOUR_TOKEN_HERE 为上面的token`);

  } catch (error) {
    console.error('❌ 生成token失败:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

generateTestToken();
