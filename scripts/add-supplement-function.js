const fs = require('fs');

const newFunction = `

/**
 * 补充4节制比赛结果信息（MVP、照片、总结）并完成比赛
 * @param {string} matchId 比赛ID
 * @param {Object} data 补充数据
 * @param {string} userId 提交者ID
 */
exports.supplementQuarterResult = async (matchId, data, userId) => {
  const { mvpUserId, photos, summary } = data;

  // 验证比赛
  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }
  if (!match.quarterSystem) {
    throw new Error('该比赛不是4节制');
  }

  // 检查是否已录入4节数据
  const quarters = await MatchQuarter.findAll({
    where: { matchId },
    order: [['quarterNumber', 'ASC']]
  });

  if (quarters.length !== 4) {
    throw new Error(\`比赛只录入了\${quarters.length}节数据，请先录入完整4节数据\`);
  }

  // 检查是否所有节次都已完成
  const incompletedQuarters = quarters.filter(q => q.status !== 'completed');
  if (incompletedQuarters.length > 0) {
    throw new Error(\`还有\${incompletedQuarters.length}个节次未完成，请先完成所有节次\`);
  }

  // 计算总得分
  const { team1FinalScore, team2FinalScore, team1TotalGoals, team2TotalGoals } =
    await getMatchCurrentScore(matchId);

  // 判断获胜队伍
  const winnerTeamId = team1FinalScore > team2FinalScore ? match.team1Id :
                      (team2FinalScore > team1FinalScore ? match.team2Id : null);

  // 查找或创建 match_results 记录
  let result = await MatchResult.findOne({ where: { matchId } });

  if (result) {
    // 更新现有记录
    await result.update({
      mvpUserId: mvpUserId || result.mvpUserId,
      photos: photos || result.photos,
      summary: summary || result.summary,
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals,
      winnerTeamId,
      submittedBy: userId,
      submittedAt: new Date()
    });
  } else {
    // 创建新记录
    result = await MatchResult.create({
      matchId,
      quarterSystem: true,
      team1Score: team1TotalGoals,
      team2Score: team2TotalGoals,
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals,
      winnerTeamId,
      mvpUserId: mvpUserId || null,
      photos: photos || null,
      summary: summary || null,
      submittedBy: userId,
      submittedAt: new Date()
    });
  }

  // 更新比赛状态为已完成
  if (match.status !== 'completed') {
    await match.update({ status: 'completed' });
  }

  logger.info(\`Quarter match result supplemented: \${matchId}, status: completed, mvp: \${mvpUserId || 'none'}\`);

  return {
    result,
    match,
    quarters,
    score: {
      team1FinalScore,
      team2FinalScore,
      team1TotalGoals,
      team2TotalGoals
    }
  };
};
`;

// 读取文件内容
const content = fs.readFileSync('src/services/quarter.service.js', 'utf8');

// 在 module.exports 之前插入新函数
const newContent = content.replace(/module\.exports = exports;/, newFunction + '\n\nmodule.exports = exports;');

fs.writeFileSync('src/services/quarter.service.js', newContent);
console.log('✅ 函数已添加到 quarter.service.js');
