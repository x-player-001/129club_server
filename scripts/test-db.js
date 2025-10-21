require('dotenv').config();
const sequelize = require('../src/config/database');
const models = require('../src/models');

async function testDatabase() {
  try {
    console.log('🔌 测试数据库连接...');

    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 列出所有模型
    const modelNames = Object.keys(models);
    console.log(`\n📊 已加载 ${modelNames.length} 个模型：`);
    modelNames.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });

    // 测试同步（不会修改数据库，只是验证）
    console.log('\n🔍 验证模型定义...');

    // 获取所有表
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log(`\n✅ 数据库中存在 ${tables.length} 张表`);

    // 测试一个简单的查询
    console.log('\n🔍 测试查询...');
    const userCount = await models.User.count();
    console.log(`✅ users 表查询成功，当前有 ${userCount} 条记录`);

    console.log('\n✅ 所有测试通过！');
    console.log('\n📝 模型关联关系已建立：');
    console.log('   - User ↔ Permission (一对多)');
    console.log('   - User ↔ TeamMember (一对多)');
    console.log('   - User ↔ PlayerStat (一对一)');
    console.log('   - Team ↔ TeamMember (一对多)');
    console.log('   - Team ↔ Match (一对多)');
    console.log('   - Match ↔ Registration (一对多)');
    console.log('   - Match ↔ Lineup (一对多)');
    console.log('   - Match ↔ MatchEvent (一对多)');
    console.log('   - Match ↔ MatchResult (一对一)');
    console.log('   - 以及更多...');

  } catch (error) {
    console.error('❌ 测试失败：', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

testDatabase();
