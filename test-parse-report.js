const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试数据
const reportText = `嘉陵摩托（红）VS 长江（花）星期六2025.10.12，轨道集团 比分:3:0

到场人员：
花：待补充
红： 黄波 施毅 洪胜 王鑫 木头 马培才 Didier
 刘立希 银河 杨涛 徐翔 海川
第一节嘉陵江边后卫小刘远射，小黑守门猝不及防，首开纪录。长江队利用嘉陵江防守松懈扳平。小黑解放后几个二过一后，打门反超。洪胜突进禁区打门将大黑小门，再扳平。木头最后关门得到洪胜助攻反插进禁区，把比分定格3:2。第二节川哥、二筒上场，银河黄波木头休息。洪胜打门在对方后卫身上折射进门，门将永健无可奈何，花队在夏雷雨和小黑及其发小的前场流畅传切下，将比分反超，夏雷雨打进一球。二筒在场下大叫"不会传球"时，下底传出好球，洪胜推射进。2比2。第三节，川哥继续冲刺。夏雷雨反越位奔袭打进一个死角，1比0，眼看就要赢球时，王鑫驰援，替下黄波后策动进攻，门前混战中川哥把球打进。1比1。第四节决战，花队由于只有1个替补（
红队4个），体力下降明显，夏雷雨回到后腰处体力已经大不如前。嘉陵江占据优势，银河突破后下底传中，洪胜推射进，永健碰到但差一点。1比0。长江队角球被打出后，洪胜得球传另一侧空出的黄波，后者带球在禁区边推进远门柱。2比0。
数据：
银河1助2裁
陈然1助1裁
洪胜4球2助
黄波 1球
小黑1球1门
永健 1裁3门
杨涛4门
施毅2助
曹枫1助
徐翔1助1裁
海川1球
MVP:洪胜 施毅 小黑 曹枫`;

async function test() {
  try {
    console.log('========================================');
    console.log('【测试】比赛简报AI解析接口');
    console.log('========================================\n');

    // 1. 先登录获取token（使用测试用户）
    console.log('步骤1: 登录获取Token...');
    const loginResponse = await axios.post(`${BASE_URL}/user/login`, {
      code: 'test_code_' + Date.now(),
      userInfo: {
        nickname: '测试用户',
        avatar: 'https://test.com/avatar.jpg'
      }
    });

    const token = loginResponse.data.data.token;
    console.log('✓ 登录成功，Token已获取\n');

    // 2. 调用解析接口
    console.log('步骤2: 调用AI解析接口...');
    console.log('简报长度:', reportText.length, '字符\n');

    const parseResponse = await axios.post(
      `${BASE_URL}/match/parse-report`,
      {
        reportText,
        autoCreate: false,
        useAI: true,
        fallbackToRegex: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('========================================');
    console.log('【解析结果】');
    console.log('========================================\n');

    const result = parseResponse.data.data;

    // 显示解析方法
    console.log('🔧 解析方法:', result.parseMethod);
    console.log('📊 置信度:', result.confidence);
    console.log('');

    // 显示基本信息
    console.log('【基本信息】');
    console.log('  队伍1:', result.basicInfo.team1Name, `(${result.basicInfo.team1Alias})`);
    console.log('  队伍2:', result.basicInfo.team2Name, `(${result.basicInfo.team2Alias})`);
    console.log('  比赛日期:', result.basicInfo.date);
    console.log('  比赛地点:', result.basicInfo.location);
    console.log('  最终比分:', result.basicInfo.finalScore);
    console.log('');

    // 显示到场人员
    console.log('【到场人员】');
    console.log('  队伍1 (' + result.participants.team1.length + '人):', result.participants.team1.join(', '));
    console.log('  队伍2 (' + result.participants.team2.length + '人):', result.participants.team2.join(', '));
    console.log('');

    // 显示节次信息
    console.log('【节次信息】共', result.quarters.length, '节');
    result.quarters.forEach((quarter, index) => {
      console.log(`  第${quarter.quarterNumber}节: ${quarter.team1Goals}:${quarter.team2Goals}`);
      console.log(`    摘要: ${quarter.summary.substring(0, 50)}...`);
    });
    console.log('');

    // 显示数据统计
    console.log('【数据统计】');
    const stats = result.statistics;
    Object.keys(stats).forEach(name => {
      const stat = stats[name];
      const parts = [];
      if (stat.goals > 0) parts.push(`${stat.goals}球`);
      if (stat.assists > 0) parts.push(`${stat.assists}助`);
      if (stat.saves > 0) parts.push(`${stat.saves}门`);
      if (stat.referee > 0) parts.push(`${stat.referee}裁`);
      console.log(`  ${name}: ${parts.join(' ')}`);
    });
    console.log('');

    // 显示MVP
    console.log('【MVP】');
    console.log('  ', result.mvp.join(', '));
    console.log('');

    // 显示匹配结果
    console.log('【队伍匹配】');
    console.log('  队伍1匹配:', result.matched.team1 ? `✓ ${result.matched.team1.name}` : '✗ 未匹配');
    console.log('  队伍2匹配:', result.matched.team2 ? `✓ ${result.matched.team2.name}` : '✗ 未匹配');
    console.log('');

    console.log('【球员匹配】');
    console.log('  队伍1已匹配:', result.matched.team1Participants.length, '人');
    console.log('  队伍2已匹配:', result.matched.team2Participants.length, '人');
    console.log('');

    // 显示警告
    if (result.warnings.length > 0) {
      console.log('⚠️  【警告信息】');
      result.warnings.forEach(warning => {
        console.log('   ', warning);
      });
      console.log('');
    }

    console.log('========================================');
    console.log('✅ 测试完成');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

test();
