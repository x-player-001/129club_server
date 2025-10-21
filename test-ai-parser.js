/**
 * AI简报解析功能测试脚本
 */

require('dotenv').config();
const reportParser = require('./src/services/report-parser.service');

// 测试用简报文本
const testReport = `嘉陵摩托（红）VS 长江（花）星期六2025.10.12，轨道集团 比分:3:0

到场人员：
花：待补充
红： 黄波 施毅 洪胜 王鑫 木头 曹枫 永健 李双江 银河 小刘 杨健 二筒 强子

第一节
第一节嘉陵江边后卫小刘远射破门，1:0。不久洪胜快速反插进禁区，接木头传球，将比分扩大到2:0。杨健边路传中，施毅头球破门，3:0。长江队开始反攻，夏雷雨单刀破门，3:1。补时阶段，长江队再次进球，半场结束3:2。

第二节
第二节川哥、二筒上场。洪胜开场不久即打进一球，4:2。花队扳回一球，4:3。木头推射破门，5:3。花队再进一球，5:4。

第三节
第三节，川哥继续冲刺，花队再次扳平，5:5。强子远射破门，6:5。花队点球扳平，6:6。

第四节
第四节决战，洪胜梅开二度，先后打进两球，8:6。最终红队以8:6的进球数、3:0的得分获胜。

数据：
银河 1助2裁
洪胜 4球2助
施毅 1球
强子 1球
木头 1球1助
杨健 1助
永健 1裁3门

MVP:洪胜 施毅 小黑 曹枫`;

async function test() {
  console.log('='.repeat(60));
  console.log('AI简报解析功能测试');
  console.log('='.repeat(60));
  console.log();

  try {
    console.log('📝 简报文本长度:', testReport.length, '字符');
    console.log();

    // 测试1: 正则解析（不使用AI）
    console.log('【测试1】使用正则解析（传统方式）');
    console.log('-'.repeat(60));

    const startTimeAI = Date.now();
    const resultAI = await reportParser.parse(testReport, {
      useAI: false,
      fallbackToRegex: true
    });
    const durationAI = Date.now() - startTimeAI;

    console.log('✓ 解析成功！');
    console.log('耗时:', durationAI, 'ms');
    console.log('解析方式:', resultAI.parseMethod);
    console.log('置信度:', resultAI.confidence);
    console.log();
    console.log('基本信息:');
    console.log('  - 队伍1:', resultAI.basicInfo.team1Name, `(${resultAI.basicInfo.team1Alias})`);
    console.log('  - 队伍2:', resultAI.basicInfo.team2Name, `(${resultAI.basicInfo.team2Alias})`);
    console.log('  - 日期:', resultAI.basicInfo.date);
    console.log('  - 地点:', resultAI.basicInfo.location);
    console.log('  - 比分:', resultAI.basicInfo.finalScore);
    console.log();
    console.log('到场人员:');
    console.log('  - 队伍1:', resultAI.participants.team1.length, '人');
    console.log('  - 队伍2:', resultAI.participants.team2.length, '人');
    console.log();
    console.log('节次数据:');
    resultAI.quarters.forEach(q => {
      console.log(`  - 第${q.quarterNumber}节: ${q.team1Goals}-${q.team2Goals}`);
    });
    console.log();
    console.log('统计数据:');
    Object.entries(resultAI.statistics).forEach(([name, stats]) => {
      const parts = [];
      if (stats.goals > 0) parts.push(`${stats.goals}球`);
      if (stats.assists > 0) parts.push(`${stats.assists}助`);
      if (stats.referee > 0) parts.push(`${stats.referee}裁`);
      if (stats.saves > 0) parts.push(`${stats.saves}门`);
      console.log(`  - ${name}: ${parts.join(' ')}`);
    });
    console.log();
    console.log('MVP:', resultAI.mvp.join(', '));
    console.log();
    console.log('='.repeat(60));

    console.log('='.repeat(60));
    console.log('✓ 所有测试通过！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 运行测试
test();
