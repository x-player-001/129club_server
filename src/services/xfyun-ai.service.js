const axios = require('axios');
const logger = require('../utils/logger');

/**
 * 讯飞星火AI服务
 * 文档: https://www.xfyun.cn/doc/spark/推理服务-http.html
 */
class XfyunAIService {
  constructor() {
    this.baseURL = 'http://maas-api.cn-huabei-1.xf-yun.com/v1';
    this.apiKey = process.env.XFYUN_API_KEY;
    this.model = process.env.XFYUN_MODEL || 'generalv3.5'; // 默认使用星火3.5
  }

  /**
   * 调用讯飞星火AI
   * @param {string} prompt 提示词
   * @param {Object} options 可选配置
   * @returns {Promise<Object>}
   */
  async chat(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('未配置讯飞星火API Key，请在.env中设置XFYUN_API_KEY');
    }

    const {
      messages = null,
      temperature = 0.2, // 较低温度保证稳定输出
      maxTokens = 4096,
      jsonMode = false // 是否强制JSON输出
    } = options;

    try {
      const requestBody = {
        model: this.model,
        messages: messages || [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      };

      // 注意：讯飞API不支持 response_format 参数
      // JSON格式输出需要在prompt中明确要求

      logger.info('Calling Xfyun AI API...', {
        model: this.model,
        promptLength: prompt.length,
        jsonMode
      });

      const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      });

      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new Error('AI返回数据格式错误');
      }

      const result = {
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };

      logger.info('Xfyun AI response received', {
        contentLength: result.content.length,
        usage: result.usage
      });

      return result;
    } catch (error) {
      logger.error('Xfyun AI API error:', {
        message: error.message,
        response: error.response?.data
      });

      if (error.response?.status === 401) {
        throw new Error('讯飞星火API认证失败，请检查API Key');
      } else if (error.response?.status === 429) {
        throw new Error('讯飞星火API调用频率超限，请稍后重试');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('讯飞星火API请求超时');
      }

      throw new Error(`讯飞星火AI调用失败: ${error.message}`);
    }
  }

  /**
   * 解析足球比赛简报（结构化输出）
   * @param {string} reportText 简报文本
   * @returns {Promise<Object>} 结构化的比赛数据
   */
  async parseMatchReport(reportText) {
    const prompt = `你是一个专业的足球比赛数据提取助手。请从以下比赛简报中提取结构化信息。

# 比赛简报文本：
${reportText}

# 提取要求：
1. **基本信息**：队伍名称、别名、日期、地点、最终比分
2. **到场人员**：两支队伍的到场人员列表（去除"待补充"等无效值）
3. **节次详情**：4个节次的进球数、文字总结
4. **数据统计**：每个球员的进球、助攻、裁判次数、门将扑救次数
5. **MVP**：MVP球员列表

# 输出格式要求：
**必须返回标准JSON格式，不要添加任何markdown标记、代码块标记或解释文字。**

JSON结构示例：
{
  "basicInfo": {
    "team1Name": "队伍1名称",
    "team1Alias": "队伍1别名",
    "team2Name": "队伍2名称",
    "team2Alias": "队伍2别名",
    "date": "YYYY-MM-DD",
    "location": "比赛地点",
    "finalScore": "X:X"
  },
  "participants": {
    "team1": ["球员1", "球员2"],
    "team2": ["球员1", "球员2"]
  },
  "quarters": [
    {
      "quarterNumber": 1,
      "team1Goals": 0,
      "team2Goals": 0,
      "summary": "第一节描述"
    }
  ],
  "statistics": {
    "球员名": {
      "goals": 0,
      "assists": 0,
      "referee": 0,
      "saves": 0
    }
  },
  "mvp": ["MVP1", "MVP2"]
}

# 重要规则：
1. 日期格式：YYYY-MM-DD（如：2025.10.12 转为 2025-10-12）
2. 比分格式：X:X（如：3:0）
3. 去除"待补充"等无效值
4. 如果字段无法提取，使用null、空数组[]或空对象{}
5. **直接返回JSON对象，不要用markdown代码块包裹**

请直接输出JSON：`;

    const result = await this.chat(prompt, {
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 8192 // 增加token限制以容纳完整JSON
    });

    try {
      let content = result.content.trim();

      // 移除可能的markdown代码块标记
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      content = content.trim();

      const parsed = JSON.parse(content);

      logger.info('AI parsing successful', {
        hasBasicInfo: !!parsed.basicInfo,
        quartersCount: parsed.quarters?.length || 0,
        participantsCount: (parsed.participants?.team1?.length || 0) + (parsed.participants?.team2?.length || 0)
      });

      return parsed;
    } catch (error) {
      logger.error('Failed to parse AI JSON response:', {
        error: error.message,
        content: result.content.substring(0, 500)
      });
      throw new Error('AI返回的JSON格式无效');
    }
  }

  /**
   * 检查服务是否可用
   */
  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = new XfyunAIService();
