const logger = require('../utils/logger');
const xfyunAI = require('./xfyun-ai.service');

/**
 * 比赛简报解析服务
 * 优先使用AI解析，降级到正则解析
 */

class MatchReportParser {
  /**
   * 解析完整简报（智能模式）
   * @param {string} reportText 简报文本
   * @param {Object} options 解析选项
   * @returns {Promise<Object>} 解析结果
   */
  async parse(reportText, options = {}) {
    const { useAI = true, fallbackToRegex = true } = options;

    // 优先使用AI解析
    if (useAI && xfyunAI.isAvailable()) {
      try {
        logger.info('Using Xfyun AI to parse match report');
        const result = await xfyunAI.parseMatchReport(reportText);

        // 验证AI返回的数据完整性
        if (this.validateParsedData(result)) {
          logger.info('AI parsing successful');
          return {
            ...result,
            parseMethod: 'AI',
            confidence: 'high'
          };
        } else {
          logger.warn('AI parsing result incomplete, falling back to regex');
        }
      } catch (error) {
        logger.error('AI parsing failed:', error.message);

        // 如果不允许降级，直接抛出错误
        if (!fallbackToRegex) {
          throw new Error('AI解析失败: ' + error.message);
        }

        logger.info('Falling back to regex parsing');
      }
    }

    // 降级到正则解析
    try {
      logger.info('Using regex to parse match report');
      const basicInfo = this.extractBasicInfo(reportText);
      const participants = this.extractParticipants(reportText);
      const quarters = this.extractQuarters(reportText);
      const statistics = this.extractStatistics(reportText);
      const mvp = this.extractMVP(reportText);

      return {
        basicInfo,
        participants,
        quarters,
        statistics,
        mvp,
        parseMethod: 'Regex',
        confidence: 'medium'
      };
    } catch (error) {
      logger.error('Regex parse report failed:', error);
      throw new Error('简报解析失败: ' + error.message);
    }
  }

  /**
   * 验证解析数据的完整性
   */
  validateParsedData(data) {
    if (!data || typeof data !== 'object') return false;

    // 检查必要字段
    if (!data.basicInfo || !data.basicInfo.team1Name || !data.basicInfo.team2Name) {
      return false;
    }

    if (!data.basicInfo.date || !data.basicInfo.finalScore) {
      return false;
    }

    // 检查节次数据
    if (!Array.isArray(data.quarters) || data.quarters.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * 提取基本信息
   * 示例: "嘉陵摩托（红）VS 长江（花）星期六2025.10.12，轨道集团 比分:3:0"
   */
  extractBasicInfo(text) {
    // 正则匹配基本信息
    const pattern = /(.+?)（(.+?)）\s*VS\s+(.+?)（(.+?)）.+?(\d{4})\.(\d{1,2})\.(\d{1,2})[，,]\s*(.+?)\s*比分[：:]\s*(\d+)[：:]\s*(\d+)/;
    const match = text.match(pattern);

    if (!match) {
      throw new Error('无法解析基本信息，请检查简报格式');
    }

    return {
      team1Name: match[1].trim(),
      team1Alias: match[2].trim(),
      team2Name: match[3].trim(),
      team2Alias: match[4].trim(),
      year: match[5],
      month: match[6],
      day: match[7],
      date: `${match[5]}-${match[6].padStart(2, '0')}-${match[7].padStart(2, '0')}`,
      location: match[8].trim(),
      finalScore: `${match[9]}:${match[10]}`
    };
  }

  /**
   * 提取到场人员
   * 示例: "到场人员：\n花：xxx xxx\n红：xxx xxx"
   */
  extractParticipants(text) {
    const participants = { team1: [], team2: [] };

    // 匹配到场人员段落
    const participantSection = text.match(/到场人员[：:]\s*(.+?)(?=第[一二三四1234]节|数据|$)/s);

    if (!participantSection) {
      return participants;
    }

    const section = participantSection[1];

    // 提取花队（队伍2）
    const team2Match = section.match(/[花蓝绿黄白黑][：:]\s*(.+?)(?:\n|红)/);
    if (team2Match) {
      const names = team2Match[1].split(/\s+/).filter(name => name && name !== '待补充');
      participants.team2 = names;
    }

    // 提取红队（队伍1）
    const team1Match = section.match(/红[：:]\s*(.+?)(?:\n|第|$)/);
    if (team1Match) {
      const names = team1Match[1].split(/\s+/).filter(Boolean);
      participants.team1 = names;
    }

    return participants;
  }

  /**
   * 提取节次信息
   * 示例: "第一节..." "第二节..." 等
   */
  extractQuarters(text) {
    const quarters = [];

    // 匹配所有节次段落
    const quarterPattern = /第([一二三四1234])节(.+?)(?=第[一二三四1234]节|数据[：:]|MVP|$)/gs;

    let match;
    while ((match = quarterPattern.exec(text)) !== null) {
      const quarterNum = this.chineseToNumber(match[1]);
      const summary = match[2].trim();

      // 从摘要文本中统计提到的比分
      const scoreInfo = this.extractScoreFromText(summary);

      quarters.push({
        quarterNumber: quarterNum,
        summary: summary,
        team1Goals: scoreInfo.team1Goals || 0,
        team2Goals: scoreInfo.team2Goals || 0
      });
    }

    return quarters;
  }

  /**
   * 从文本中提取比分
   */
  extractScoreFromText(text) {
    // 尝试匹配明确的比分格式 "X比X" 或 "X:X"
    const scoreMatch = text.match(/(\d+)\s*[比:：]\s*(\d+)/);

    if (scoreMatch) {
      return {
        team1Goals: parseInt(scoreMatch[1]),
        team2Goals: parseInt(scoreMatch[2])
      };
    }

    // 统计"进""打进""破门"等关键词
    const goalKeywords = ['进', '打进', '破门', '得分', '推射进'];
    let goalCount = 0;

    goalKeywords.forEach(keyword => {
      const matches = text.match(new RegExp(keyword, 'g'));
      if (matches) {
        goalCount += matches.length;
      }
    });

    return {
      team1Goals: Math.floor(goalCount / 2),
      team2Goals: Math.floor(goalCount / 2)
    };
  }

  /**
   * 提取数据统计
   * 示例: "银河1助2裁\n洪胜4球2助"
   */
  extractStatistics(text) {
    const stats = {};

    // 匹配数据段落
    const statsSection = text.match(/数据[：:]\s*(.+?)(?=MVP|$)/s);

    if (!statsSection) {
      return stats;
    }

    const lines = statsSection[1].split('\n').filter(Boolean);

    lines.forEach(line => {
      // 匹配姓名和数据
      const nameMatch = line.match(/^([^\d]+?)\s+/);
      if (!nameMatch) return;

      const name = nameMatch[1].trim();

      stats[name] = {
        goals: this.extractNumber(line, /(\d+)球/),
        assists: this.extractNumber(line, /(\d+)助/),
        referee: this.extractNumber(line, /(\d+)裁/),
        saves: this.extractNumber(line, /(\d+)门/)
      };
    });

    return stats;
  }

  /**
   * 提取MVP
   * 示例: "MVP:洪胜 施毅 小黑 曹枫"
   */
  extractMVP(text) {
    const mvpMatch = text.match(/MVP[：:]\s*(.+?)(?:\n|$)/);

    if (mvpMatch) {
      return mvpMatch[1].split(/\s+/).filter(Boolean);
    }

    return [];
  }

  /**
   * 中文数字转阿拉伯数字
   */
  chineseToNumber(chinese) {
    const map = { '一': 1, '二': 2, '三': 3, '四': 4 };
    return map[chinese] || parseInt(chinese);
  }

  /**
   * 从文本中提取数字
   */
  extractNumber(text, pattern) {
    const match = text.match(pattern);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 匹配用户（通过昵称或真实姓名）
   * @param {string} name 简报中的姓名
   * @param {Array} users 用户列表
   */
  matchUser(name, users) {
    // 精确匹配
    let user = users.find(u =>
      u.nickname === name ||
      u.realName === name
    );

    if (user) return user;

    // 模糊匹配（包含）
    user = users.find(u =>
      (u.nickname && u.nickname.includes(name)) ||
      (u.realName && u.realName.includes(name)) ||
      (name.includes(u.nickname)) ||
      (name.includes(u.realName))
    );

    return user || null;
  }

  /**
   * 批量匹配用户
   */
  matchUsers(names, users) {
    const matched = [];
    const unmatched = [];

    names.forEach(name => {
      const user = this.matchUser(name, users);
      if (user) {
        matched.push({ name, user });
      } else {
        unmatched.push(name);
      }
    });

    return { matched, unmatched };
  }
}

module.exports = new MatchReportParser();
