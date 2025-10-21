/**
 * Draft选人功能测试脚本
 * 模拟完整的选人流程
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试数据（需要从数据库中获取实际ID）
const TEST_DATA = {
  adminToken: '', // 管理员token
  captain1Token: '', // 队长1 token
  captain2Token: '', // 队长2 token
  season: '2025-S2',
  captain1Id: '',
  captain2Id: '',
  team1Id: '6996d579-431f-4281-acf6-4c8bd0f76a20', // 红队
  team2Id: 'dfa42511-c9e3-4a50-9d67-e7ab390bddbd', // 蓝队
  playerIds: [] // 可选球员ID列表
};

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}➤ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// API请求封装
async function request(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || error.response.statusText);
    }
    throw error;
  }
}

// 测试步骤
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🏆 Draft选人功能测试');
  console.log('='.repeat(60) + '\n');

  try {
    // ==================== 准备：从数据库获取数据 ====================
    log.step('准备: 从数据库加载测试数据');

    const { User, Team } = require('./src/models');

    // 获取队伍
    const teams = await Team.findAll({
      where: { status: 'active' },
      limit: 2
    });

    if (teams.length < 2) {
      throw new Error('队伍数量不足，至少需要2支活跃队伍');
    }

    TEST_DATA.team1Id = teams[0].id;
    TEST_DATA.team2Id = teams[1].id;

    log.success(`找到 ${teams.length} 支队伍`);
    log.info(`  队伍1: ${teams[0].name} (${teams[0].id})`);
    log.info(`  队伍2: ${teams[1].name} (${teams[1].id})`);

    await sleep(500);

    // 获取管理员
    const admin = await User.findOne({
      where: { role: 'super_admin' }
    });

    if (!admin) {
      throw new Error('未找到管理员用户，请先创建管理员账号');
    }

    log.success(`找到管理员: ${admin.nickname} (${admin.id})`);

    // 获取正式队员
    const regularPlayers = await User.findAll({
      where: {
        memberType: 'regular',
        status: 'active'
      },
      limit: 10
    });

    if (regularPlayers.length < 4) {
      log.warn(`正式队员不足4人，当前只有 ${regularPlayers.length} 人`);
      log.warn('建议：将一些用户的 member_type 改为 "regular"');
      return;
    }

    TEST_DATA.playerIds = regularPlayers.map(p => p.id);
    log.success(`找到 ${regularPlayers.length} 名正式队员`);
    regularPlayers.forEach((p, i) => {
      let positionStr = '无位置';
      if (p.position) {
        try {
          const positions = JSON.parse(p.position);
          positionStr = Array.isArray(positions) ? positions.join(',') : p.position;
        } catch (e) {
          positionStr = p.position; // 如果解析失败，直接显示原始值
        }
      }
      log.info(`  ${i + 1}. ${p.nickname || p.realName} (${positionStr})`);
    });

    await sleep(500);

    // ==================== 步骤1：生成测试Token ====================
    log.step('\n步骤1: 生成测试Token');

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-129club';

    TEST_DATA.adminToken = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    log.success('管理员Token已生成');

    await sleep(500);

    // ==================== 步骤2：发起重组 ====================
    log.step('\n步骤2: 发起队伍重组');

    // 随机选择两个队长
    const captain1 = regularPlayers[0];
    const captain2 = regularPlayers[1];

    const reshuffleData = {
      season: TEST_DATA.season,
      captain1Id: captain1.id,
      captain2Id: captain2.id,
      team1Id: TEST_DATA.team1Id,
      team2Id: TEST_DATA.team2Id
    };

    log.info(`  队长1: ${captain1.nickname} → 队伍1`);
    log.info(`  队长2: ${captain2.nickname} → 队伍2`);

    const reshuffleResult = await request(
      'POST',
      '/team/reshuffle/start',
      reshuffleData,
      TEST_DATA.adminToken
    );

    if (reshuffleResult.success) {
      const reshuffleId = reshuffleResult.data.id;
      log.success(`重组已发起！ID: ${reshuffleId}`);

      await sleep(500);

      // ==================== 步骤3：获取可选球员 ====================
      log.step('\n步骤3: 获取可选球员列表');

      const availableResult = await request(
        'GET',
        `/team/reshuffle/${reshuffleId}/available`,
        null,
        TEST_DATA.adminToken
      );

      if (availableResult.success) {
        const available = availableResult.data;
        log.success(`可选球员: ${available.length} 人`);
        available.slice(0, 5).forEach((p, i) => {
          log.info(`  ${i + 1}. ${p.nickname} - ${p.position || '无位置'} - 球衣${p.jerseyNumber || '无'}`);
        });
      }

      await sleep(500);

      // ==================== 步骤4：模拟选人过程 ====================
      log.step('\n步骤4: 模拟蛇形选人（1-2-2-2...）');

      // 生成队长Token
      const captain1Token = jwt.sign(
        { id: captain1.id, role: captain1.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const captain2Token = jwt.sign(
        { id: captain2.id, role: captain2.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 选人逻辑: 1(C1), 2(C2), 3(C2), 4(C1), 5(C1), 6(C2), 7(C2)...
      const pickSequence = [
        { captain: 1, token: captain1Token, name: captain1.nickname },
        { captain: 2, token: captain2Token, name: captain2.nickname },
        { captain: 2, token: captain2Token, name: captain2.nickname },
        { captain: 1, token: captain1Token, name: captain1.nickname },
        { captain: 1, token: captain1Token, name: captain1.nickname },
        { captain: 2, token: captain2Token, name: captain2.nickname }
      ];

      // 从第3个球员开始选（前两个是队长）
      for (let i = 0; i < Math.min(6, regularPlayers.length - 2); i++) {
        const playerToPick = regularPlayers[i + 2];
        const turn = pickSequence[i];

        log.info(`\n  第 ${i + 1} 顺位: 队长${turn.captain} (${turn.name}) 选择...`);

        try {
          const pickResult = await request(
            'POST',
            '/team/reshuffle/pick',
            {
              reshuffleId: reshuffleId,
              pickedUserId: playerToPick.id
            },
            turn.token
          );

          if (pickResult.success) {
            const pick = pickResult.data.pick;
            log.success(`  ✓ 选中: ${pick.pickedUser.nickname} (位置: ${pick.pickedUser.position || '无'}, 球衣: ${pick.pickedUser.jerseyNumber || '无'})`);
            log.info(`    → 加入 ${pick.team.name}`);
          }
        } catch (error) {
          log.error(`  选人失败: ${error.message}`);
        }

        await sleep(800);
      }

      await sleep(500);

      // ==================== 步骤5：获取重组状态 ====================
      log.step('\n步骤5: 获取重组状态（轮询接口）');

      const statusResult = await request(
        'GET',
        `/team/reshuffle/${reshuffleId}/status`,
        null,
        TEST_DATA.adminToken
      );

      if (statusResult.success) {
        const status = statusResult.data;
        log.success('重组状态:');
        log.info(`  赛季: ${status.reshuffle.season}`);
        log.info(`  状态: ${status.reshuffle.status}`);
        log.info(`  已选人数: ${status.reshuffle.picks.length}`);
        log.info(`  队伍1已选: ${status.team1PickedCount} 人`);
        log.info(`  队伍2已选: ${status.team2PickedCount} 人`);
        log.info(`  下一顺位: 第 ${status.currentPickOrder} 顺位`);
        if (status.currentCaptain) {
          log.info(`  轮到: ${status.currentCaptain.nickname}`);
        }
      }

      await sleep(500);

      // ==================== 步骤6：完成重组 ====================
      log.step('\n步骤6: 完成重组');

      const completeResult = await request(
        'POST',
        `/team/reshuffle/${reshuffleId}/complete`,
        null,
        TEST_DATA.adminToken
      );

      if (completeResult.success) {
        log.success('重组已完成！球员已加入新队伍');
      }

      await sleep(500);

      // ==================== 步骤7：查询球员Draft历史 ====================
      log.step('\n步骤7: 查询球员Draft历史（转会记录）');

      const testPlayer = regularPlayers[2];
      const historyResult = await request(
        'GET',
        `/team/draft-history/${testPlayer.id}`,
        null,
        TEST_DATA.adminToken
      );

      if (historyResult.success) {
        const history = historyResult.data;
        log.success(`${testPlayer.nickname} 的Draft历史:`);
        if (history.length > 0) {
          history.forEach((record, i) => {
            log.info(`  ${i + 1}. ${record.reshuffle.season} - 第${record.pickOrder}顺位 - ${record.team.name} - 队长: ${record.captain.nickname}`);
          });
        } else {
          log.info('  暂无历史记录');
        }
      }

      await sleep(500);

      // ==================== 步骤8：查询重组历史 ====================
      log.step('\n步骤8: 查询重组历史记录');

      const reshuffleHistoryResult = await request(
        'GET',
        '/team/reshuffle/history',
        null,
        TEST_DATA.adminToken
      );

      if (reshuffleHistoryResult.success) {
        const history = reshuffleHistoryResult.data;
        log.success(`共 ${history.total} 次重组记录:`);
        history.list.forEach((record, i) => {
          log.info(`  ${i + 1}. ${record.season} - ${record.team1.name} vs ${record.team2.name} - ${record.picks.length}人`);
        });
      }

    }

    console.log('\n' + '='.repeat(60));
    log.success('所有测试完成！✨');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log.error(`测试失败: ${error.message}`);
    console.error(error);
    console.log('='.repeat(60) + '\n');
  } finally {
    process.exit(0);
  }
}

// 运行测试
runTests();
