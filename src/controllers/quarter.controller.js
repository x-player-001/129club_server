const quarterService = require('../services/quarter.service');
const reportParser = require('../services/report-parser.service');
const matchService = require('../services/match.service');
const { Team, User } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const taskStore = require('../utils/task-store');

/**
 * 录入单个节次
 */
exports.submitQuarter = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const userId = ctx.state.user.id;
    const data = ctx.request.body;

    const result = await quarterService.submitQuarter(matchId, data, userId);

    success(ctx, result);
  } catch (err) {
    logger.error('Submit quarter error:', err);
    error(ctx, err.message);
  }
};

/**
 * 批量录入完整4节比赛
 */
exports.submitCompleteQuarters = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const userId = ctx.state.user.id;
    const data = ctx.request.body;

    const result = await quarterService.submitCompleteQuarters(matchId, data, userId);

    success(ctx, result);
  } catch (err) {
    logger.error('Submit complete quarters error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取比赛详情（含节次）
 */
exports.getMatchDetail = async (ctx) => {
  try {
    const { matchId } = ctx.params;

    const match = await quarterService.getMatchWithQuarters(matchId);

    if (!match) {
      return error(ctx, '比赛不存在', 404);
    }

    success(ctx, match);
  } catch (err) {
    logger.error('Get match detail error:', err);
    error(ctx, err.message);
  }
};

/**
 * 获取球员比赛统计
 */
exports.getPlayerStats = async (ctx) => {
  try {
    const { matchId } = ctx.params;

    const stats = await quarterService.getPlayerMatchStats(matchId);

    success(ctx, stats);
  } catch (err) {
    logger.error('Get player stats error:', err);
    error(ctx, err.message);
  }
};

/**
 * 解析比赛简报（异步任务模式）
 */
exports.parseReport = async (ctx) => {
  try {
    const { reportText, autoCreate = false, useAI = true, fallbackToRegex = true } = ctx.request.body;
    const userId = ctx.state.user.id;

    if (!reportText) {
      return error(ctx, '请提供简报文本');
    }

    // 创建异步任务
    const taskInfo = taskStore.createTask('parse-report', {
      reportText,
      autoCreate,
      useAI,
      fallbackToRegex
    }, userId);

    // 启动后台异步处理
    setImmediate(async () => {
      try {
        // 更新任务状态为处理中
        taskStore.updateTask(taskInfo.taskId, 'processing', {
          progress: 10,
          progressMessage: '开始解析简报...'
        });

        // 解析简报
        taskStore.updateProgress(taskInfo.taskId, 30, '正在解析简报内容...');
        const parsed = await reportParser.parse(reportText, { useAI, fallbackToRegex });

        // 验证解析结果
        if (!parsed || !parsed.basicInfo) {
          taskStore.setTaskError(taskInfo.taskId, '简报解析失败，无法提取基本信息');
          return;
        }

        // 尝试匹配队伍
        taskStore.updateProgress(taskInfo.taskId, 50, '正在匹配队伍信息...');
        const teams = await Team.findAll({ attributes: ['id', 'name'] });

        const team1 = teams.find(t =>
          t.name === parsed.basicInfo.team1Name ||
          (parsed.basicInfo.team1Alias && t.name.includes(parsed.basicInfo.team1Alias))
        );

        const team2 = teams.find(t =>
          t.name === parsed.basicInfo.team2Name ||
          (parsed.basicInfo.team2Alias && t.name.includes(parsed.basicInfo.team2Alias))
        );

        // 尝试匹配用户
        taskStore.updateProgress(taskInfo.taskId, 60, '正在匹配参赛人员...');
        const allUsers = await User.findAll({ attributes: ['id', 'nickname', 'realName'] });

        const team1Participants = reportParser.matchUsers(parsed.participants.team1, allUsers);
        const team2Participants = reportParser.matchUsers(parsed.participants.team2, allUsers);

        const warnings = [];

        if (!team1) {
          warnings.push(`无法匹配队伍: ${parsed.basicInfo.team1Name}`);
        }
        if (!team2) {
          warnings.push(`无法匹配队伍: ${parsed.basicInfo.team2Name}`);
        }

        if (team1Participants.unmatched.length > 0) {
          warnings.push(`无法匹配用户: ${team1Participants.unmatched.join(', ')}`);
        }
        if (team2Participants.unmatched.length > 0) {
          warnings.push(`无法匹配用户: ${team2Participants.unmatched.join(', ')}`);
        }

        const result = {
          parsed,
          matched: {
            team1,
            team2,
            team1Participants: team1Participants.matched,
            team2Participants: team2Participants.matched
          },
          warnings
        };

        // 如果请求自动创建且没有警告
        if (autoCreate && warnings.length === 0) {
          taskStore.updateProgress(taskInfo.taskId, 80, '正在创建比赛记录...');

          // 创建比赛
          const match = await matchService.createMatch({
            title: `${parsed.basicInfo.team1Name} vs ${parsed.basicInfo.team2Name}`,
            team1Id: team1.id,
            team2Id: team2.id,
            matchDate: new Date(parsed.basicInfo.date),
            location: parsed.basicInfo.location,
            quarterSystem: true
          }, userId);

          // 准备节次数据
          const quartersData = {
            quarters: parsed.quarters,
            participants: {
              team1: team1Participants.matched.map(m => m.user.id),
              team2: team2Participants.matched.map(m => m.user.id)
            },
            mvpUserIds: [], // TODO: 匹配MVP
            summary: `比赛总结（从简报导入）`
          };

          taskStore.updateProgress(taskInfo.taskId, 90, '正在录入比赛数据...');
          const quarterResult = await quarterService.submitCompleteQuarters(match.id, quartersData, userId);

          result.matchId = match.id;
          result.created = true;
        }

        // 设置任务完成
        taskStore.setTaskResult(taskInfo.taskId, result);

        logger.info('Parse report task completed', { taskId: taskInfo.taskId });
      } catch (err) {
        logger.error('Parse report task failed:', err);
        taskStore.setTaskError(taskInfo.taskId, err.message || '解析失败');
      }
    });

    // 立即返回任务信息
    success(ctx, {
      taskId: taskInfo.taskId,
      status: taskInfo.status,
      message: '解析任务已创建，请通过任务ID查询进度'
    });
  } catch (err) {
    logger.error('Create parse task error:', err);
    error(ctx, err.message);
  }
};

/**
 * 查询解析任务状态
 */
exports.getParseTask = async (ctx) => {
  try {
    const { taskId } = ctx.params;

    const task = taskStore.getTask(taskId);

    if (!task) {
      return error(ctx, '任务不存在或已过期', 404);
    }

    // 只返回必要的信息给前端
    const response = {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      progressMessage: task.progressMessage,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt
    };

    // 如果任务完成，返回结果
    if (task.status === 'completed') {
      response.result = task.result;
    }

    // 如果任务失败，返回错误信息
    if (task.status === 'failed') {
      response.error = task.error;
    }

    success(ctx, response);
  } catch (err) {
    logger.error('Get parse task error:', err);
    error(ctx, err.message);
  }
};

module.exports = exports;

// 补充4节制比赛结果（MVP、照片、总结）并完成比赛
exports.supplementQuarterResult = async (ctx) => {
  try {
    const { matchId } = ctx.params;
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await quarterService.supplementQuarterResult(matchId, data, userId);
    success(ctx, result, '比赛结果已提交');
  } catch (err) {
    error(ctx, err.message);
  }
};
