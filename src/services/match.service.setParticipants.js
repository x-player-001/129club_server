// 临时文件：设置参赛球员的函数，需要添加到 match.service.js

/**
 * 设置比赛参赛球员（实际到场球员）
 * @param {string} matchId 比赛ID
 * @param {Object} data 参赛球员数据
 */
exports.setMatchParticipants = async (matchId, data) => {
  const { team1, team2 } = data;

  const match = await Match.findByPk(matchId);
  if (!match) {
    throw new Error('比赛不存在');
  }

  // 验证传入的球员是否已报名
  if (team1 && team1.length > 0) {
    const team1Registrations = await Registration.count({
      where: {
        matchId,
        teamId: match.team1Id,
        userId: { [Op.in]: team1 },
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });
    if (team1Registrations !== team1.length) {
      throw new Error('队伍1存在未报名的球员');
    }
  }

  if (team2 && team2.length > 0) {
    const team2Registrations = await Registration.count({
      where: {
        matchId,
        teamId: match.team2Id,
        userId: { [Op.in]: team2 },
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    });
    if (team2Registrations !== team2.length) {
      throw new Error('队伍2存在未报名的球员');
    }
  }

  // 清空原有参赛球员
  await MatchParticipant.destroy({
    where: { matchId }
  });

  // 添加新的参赛球员
  const participants = [];

  if (team1 && team1.length > 0) {
    for (const userId of team1) {
      const participant = await MatchParticipant.create({
        matchId,
        teamId: match.team1Id,
        userId,
        isPresent: true
      });
      participants.push(participant);
    }
  }

  if (team2 && team2.length > 0) {
    for (const userId of team2) {
      const participant = await MatchParticipant.create({
        matchId,
        teamId: match.team2Id,
        userId,
        isPresent: true
      });
      participants.push(participant);
    }
  }

  logger.info(`Match participants set: ${matchId}, team1: ${team1 ? team1.length : 0}, team2: ${team2 ? team2.length : 0}`);

  return {
    team1Count: team1 ? team1.length : 0,
    team2Count: team2 ? team2.length : 0,
    totalCount: participants.length,
    participants
  };
};
