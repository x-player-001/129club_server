/**
 * 比赛记录模拟数据插入脚本
 * 插入：比赛、报名记录、阵容、比赛事件、比赛结果等模拟数据
 */

const sequelize = require('../src/config/database');
const {
  Team, User, TeamMember, Match, Registration,
  Lineup, MatchEvent, MatchResult, PlayerStat, TeamStat
} = require('../src/models');
const logger = require('../src/utils/logger');

async function seedMatchData() {
  const transaction = await sequelize.transaction();

  try {
    logger.info('开始插入比赛模拟数据...');

    // 1. 获取现有的队伍和用户
    const teams = await Team.findAll({
      limit: 10,
      include: [{
        model: TeamMember,
        as: 'members',
        where: { isActive: true },
        required: false,
        include: [{
          model: User,
          as: 'user'
        }]
      }],
      transaction
    });

    if (teams.length < 2) {
      throw new Error('需要至少2个队伍才能创建比赛数据');
    }

    logger.info(`找到 ${teams.length} 个队伍`);

    // 2. 创建比赛数据（已完成和进行中的比赛）
    const matches = [];
    const matchData = [
      {
        title: '红队 vs 蓝队',
        team1Id: teams[0].id,
        team2Id: teams[1].id,
        matchDate: new Date('2025-10-15T14:00:00'),
        location: '129足球场',
        status: 'completed',
        registrationDeadline: new Date('2025-10-14T12:00:00'),
        maxPlayersPerTeam: 11,
        createdBy: teams[0].captainId
      },
      {
        title: '蓝队 vs 绿队',
        team1Id: teams[1].id,
        team2Id: teams.length > 2 ? teams[2].id : teams[0].id,
        matchDate: new Date('2025-10-20T14:00:00'),
        location: '129足球场',
        status: 'registration',
        registrationDeadline: new Date('2025-10-19T12:00:00'),
        maxPlayersPerTeam: 11,
        createdBy: teams[1].captainId
      },
      {
        title: '红队 vs 绿队',
        team1Id: teams[0].id,
        team2Id: teams.length > 2 ? teams[2].id : teams[1].id,
        matchDate: new Date('2025-10-08T14:00:00'),
        location: '129足球场',
        status: 'completed',
        registrationDeadline: new Date('2025-10-07T12:00:00'),
        maxPlayersPerTeam: 11,
        createdBy: teams[0].captainId
      },
      {
        title: '周末友谊赛',
        team1Id: teams[0].id,
        team2Id: teams[1].id,
        matchDate: new Date('2025-10-25T15:00:00'),
        location: '129足球场',
        status: 'upcoming',
        registrationDeadline: new Date('2025-10-24T12:00:00'),
        maxPlayersPerTeam: 11,
        createdBy: teams[0].captainId
      }
    ];

    for (const data of matchData) {
      const match = await Match.create(data, { transaction });
      matches.push(match);
      logger.info(`创建比赛: ${match.title} (${match.status})`);
    }

    // 3. 为已完成的比赛创建报名记录、阵容、事件和结果
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];

      if (match.status === 'completed') {
        // 获取参赛队伍的成员
        const team1 = teams.find(t => t.id === match.team1Id);
        const team2 = teams.find(t => t.id === match.team2Id);

        const team1Members = team1.members || [];
        const team2Members = team2.members || [];

        logger.info(`比赛 ${match.title}: 队伍1有${team1Members.length}人, 队伍2有${team2Members.length}人`);

        // 创建报名记录
        const registrations = [];
        for (const member of team1Members.slice(0, 8)) {
          const reg = await Registration.create({
            matchId: match.id,
            userId: member.userId,
            teamId: team1.id,
            status: 'confirmed',
            registeredAt: new Date(match.matchDate.getTime() - 2 * 24 * 60 * 60 * 1000)
          }, { transaction });
          registrations.push(reg);
        }

        for (const member of team2Members.slice(0, 8)) {
          const reg = await Registration.create({
            matchId: match.id,
            userId: member.userId,
            teamId: team2.id,
            status: 'confirmed',
            registeredAt: new Date(match.matchDate.getTime() - 2 * 24 * 60 * 60 * 1000)
          }, { transaction });
          registrations.push(reg);
        }

        logger.info(`创建 ${registrations.length} 条报名记录`);

        // 创建阵容（首发和替补）
        const positions = ['GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'FW', 'SUB'];

        for (let j = 0; j < Math.min(team1Members.length, 8); j++) {
          await Lineup.create({
            matchId: match.id,
            teamId: team1.id,
            userId: team1Members[j].userId,
            position: positions[j] || 'SUB',
            jerseyNumber: j + 1,
            isStarter: j < 7,
            setBy: team1.captainId,
            setAt: new Date(match.matchDate.getTime() - 1 * 60 * 60 * 1000)
          }, { transaction });
        }

        for (let j = 0; j < Math.min(team2Members.length, 8); j++) {
          await Lineup.create({
            matchId: match.id,
            teamId: team2.id,
            userId: team2Members[j].userId,
            position: positions[j] || 'SUB',
            jerseyNumber: j + 1,
            isStarter: j < 7,
            setBy: team2.captainId,
            setAt: new Date(match.matchDate.getTime() - 1 * 60 * 60 * 1000)
          }, { transaction });
        }

        logger.info(`创建阵容记录`);

        // 创建比赛事件（进球、助攻等）
        const events = [];
        const team1Score = Math.floor(Math.random() * 6) + 1; // 1-6个进球
        const team2Score = Math.floor(Math.random() * 6); // 0-5个进球

        // 队伍1进球事件
        for (let g = 0; g < team1Score; g++) {
          const scorerIndex = Math.floor(Math.random() * Math.min(team1Members.length, 6)) + 1; // 跳过守门员
          const assistIndex = Math.floor(Math.random() * Math.min(team1Members.length, 6)) + 1;

          if (team1Members[scorerIndex]) {
            const event = await MatchEvent.create({
              matchId: match.id,
              teamId: team1.id,
              userId: team1Members[scorerIndex].userId,
              eventType: 'goal',
              minute: Math.floor(Math.random() * 90) + 1,
              assistUserId: team1Members[assistIndex] && assistIndex !== scorerIndex ? team1Members[assistIndex].userId : null,
              recordedBy: team1.captainId,
              recordedAt: match.matchDate
            }, { transaction });
            events.push(event);

            // 如果有助攻，创建助攻事件
            if (event.assistUserId) {
              await MatchEvent.create({
                matchId: match.id,
                teamId: team1.id,
                userId: event.assistUserId,
                eventType: 'assist',
                minute: event.minute,
                recordedBy: team1.captainId,
                recordedAt: match.matchDate
              }, { transaction });
            }
          }
        }

        // 队伍2进球事件
        for (let g = 0; g < team2Score; g++) {
          const scorerIndex = Math.floor(Math.random() * Math.min(team2Members.length, 6)) + 1;
          const assistIndex = Math.floor(Math.random() * Math.min(team2Members.length, 6)) + 1;

          if (team2Members[scorerIndex]) {
            const event = await MatchEvent.create({
              matchId: match.id,
              teamId: team2.id,
              userId: team2Members[scorerIndex].userId,
              eventType: 'goal',
              minute: Math.floor(Math.random() * 90) + 1,
              assistUserId: team2Members[assistIndex] && assistIndex !== scorerIndex ? team2Members[assistIndex].userId : null,
              recordedBy: team2.captainId,
              recordedAt: match.matchDate
            }, { transaction });
            events.push(event);

            if (event.assistUserId) {
              await MatchEvent.create({
                matchId: match.id,
                teamId: team2.id,
                userId: event.assistUserId,
                eventType: 'assist',
                minute: event.minute,
                recordedBy: team2.captainId,
                recordedAt: match.matchDate
              }, { transaction });
            }
          }
        }

        logger.info(`创建 ${events.length} 个进球事件`);

        // 创建比赛结果
        const winnerTeamId = team1Score > team2Score ? team1.id : (team2Score > team1Score ? team2.id : null);
        const mvpIndex = Math.floor(Math.random() * (team1Score > team2Score ? team1Members.length : team2Members.length));
        const mvpMember = team1Score > team2Score ? team1Members[mvpIndex] : team2Members[mvpIndex];

        await MatchResult.create({
          matchId: match.id,
          team1Score,
          team2Score,
          winnerTeamId,
          mvpUserId: mvpMember ? mvpMember.userId : null,
          summary: team1Score > team2Score
            ? `${team1.name}以${team1Score}:${team2Score}战胜${team2.name}，精彩的进攻表现！`
            : (team2Score > team1Score
              ? `${team2.name}以${team2Score}:${team1Score}战胜${team1.name}，防守反击成功！`
              : `双方${team1Score}:${team2Score}战平，势均力敌的较量！`),
          submittedBy: team1.captainId,
          submittedAt: match.matchDate
        }, { transaction });

        logger.info(`创建比赛结果: ${team1Score}:${team2Score}`);
      } else if (match.status === 'registration') {
        // 为报名中的比赛创建部分报名记录
        const team1 = teams.find(t => t.id === match.team1Id);
        const team2 = teams.find(t => t.id === match.team2Id);

        const team1Members = team1.members || [];
        const team2Members = team2.members || [];

        for (const member of team1Members.slice(0, 5)) {
          await Registration.create({
            matchId: match.id,
            userId: member.userId,
            teamId: team1.id,
            status: 'registered',
            registeredAt: new Date()
          }, { transaction });
        }

        for (const member of team2Members.slice(0, 4)) {
          await Registration.create({
            matchId: match.id,
            userId: member.userId,
            teamId: team2.id,
            status: 'registered',
            registeredAt: new Date()
          }, { transaction });
        }

        logger.info(`创建报名中比赛的部分报名记录`);
      }
    }

    await transaction.commit();

    logger.info('比赛模拟数据插入完成！');
    logger.info('数据统计:');
    logger.info(`- 创建比赛: ${matches.length} 场`);
    logger.info(`- 已完成比赛: ${matches.filter(m => m.status === 'completed').length} 场`);
    logger.info(`- 报名中比赛: ${matches.filter(m => m.status === 'registration').length} 场`);
    logger.info(`- 即将开始比赛: ${matches.filter(m => m.status === 'upcoming').length} 场`);

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('比赛数据插入失败:', error);
    console.error(error);
    process.exit(1);
  }
}

// 执行数据插入
seedMatchData();
