const User = require('./User');
const Permission = require('./Permission');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const TeamReshuffle = require('./TeamReshuffle');
const DraftPick = require('./DraftPick');
const Match = require('./Match');
const Registration = require('./Registration');
const Lineup = require('./Lineup');
const MatchEvent = require('./MatchEvent');
const MatchResult = require('./MatchResult');
const MatchQuarter = require('./MatchQuarter');
const MatchParticipant = require('./MatchParticipant');
const PlayerStat = require('./PlayerStat');
const PlayerTeamStat = require('./PlayerTeamStat');
const TeamStat = require('./TeamStat');
const Notice = require('./Notice');
const Season = require('./Season');
const Achievement = require('./Achievement');
const UserAchievement = require('./UserAchievement');
const Notification = require('./Notification');

// ====================================
// 定义模型关联关系
// ====================================

// User 关联
User.belongsTo(Team, { foreignKey: 'currentTeamId', as: 'currentTeam' });
User.hasMany(Permission, { foreignKey: 'userId', as: 'permissions' });
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });
User.hasOne(PlayerStat, { foreignKey: 'userId', as: 'stats' });
User.hasMany(PlayerTeamStat, { foreignKey: 'userId', as: 'teamStats' });
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
User.hasMany(Notice, { foreignKey: 'publisherId', as: 'notices' });

// Team 关联
Team.belongsTo(User, { foreignKey: 'captainId', as: 'captain' });
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
Team.hasOne(TeamStat, { foreignKey: 'teamId', as: 'stats' });
Team.hasMany(PlayerTeamStat, { foreignKey: 'teamId', as: 'playerStats' });
Team.hasMany(Match, { foreignKey: 'team1Id', as: 'homeMatches' });
Team.hasMany(Match, { foreignKey: 'team2Id', as: 'awayMatches' });
Team.hasMany(Registration, { foreignKey: 'teamId', as: 'registrations' });
Team.hasMany(Lineup, { foreignKey: 'teamId', as: 'lineups' });

// TeamMember 关联
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Permission 关联
Permission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// TeamReshuffle 关联
TeamReshuffle.belongsTo(User, { foreignKey: 'initiatorId', as: 'initiator' });
TeamReshuffle.belongsTo(User, { foreignKey: 'captain1Id', as: 'captain1' });
TeamReshuffle.belongsTo(User, { foreignKey: 'captain2Id', as: 'captain2' });
TeamReshuffle.belongsTo(Team, { foreignKey: 'team1Id', as: 'team1' });
TeamReshuffle.belongsTo(Team, { foreignKey: 'team2Id', as: 'team2' });
TeamReshuffle.hasMany(DraftPick, { foreignKey: 'reshuffleId', as: 'picks' });

// DraftPick 关联
DraftPick.belongsTo(TeamReshuffle, { foreignKey: 'reshuffleId', as: 'reshuffle' });
DraftPick.belongsTo(User, { foreignKey: 'captainId', as: 'captain' });
DraftPick.belongsTo(User, { foreignKey: 'pickedUserId', as: 'pickedUser' });
DraftPick.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Match 关联
Match.belongsTo(Team, { foreignKey: 'team1Id', as: 'team1' });
Match.belongsTo(Team, { foreignKey: 'team2Id', as: 'team2' });
Match.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Match.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
Match.hasMany(Registration, { foreignKey: 'matchId', as: 'registrations' });
Match.hasMany(Lineup, { foreignKey: 'matchId', as: 'lineups' });
Match.hasMany(MatchEvent, { foreignKey: 'matchId', as: 'events' });
Match.hasOne(MatchResult, { foreignKey: 'matchId', as: 'result' });
Match.hasMany(MatchQuarter, { foreignKey: 'matchId', as: 'quarters' });
Match.hasMany(MatchParticipant, { foreignKey: 'matchId', as: 'participants' });

// Registration 关联
Registration.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Registration.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Lineup 关联
Lineup.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
Lineup.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Lineup.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Lineup.belongsTo(User, { foreignKey: 'setBy', as: 'setter' });

// MatchEvent 关联
MatchEvent.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MatchEvent.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
MatchEvent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
MatchEvent.belongsTo(User, { foreignKey: 'assistUserId', as: 'assistUser' });
MatchEvent.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

// MatchResult 关联
MatchResult.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MatchResult.belongsTo(Team, { foreignKey: 'winnerTeamId', as: 'winnerTeam' });
// Note: mvpUserIds is now a JSON array, no foreign key relation
MatchResult.belongsTo(User, { foreignKey: 'submittedBy', as: 'submitter' });

// PlayerStat 关联
PlayerStat.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// PlayerTeamStat 关联
PlayerTeamStat.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PlayerTeamStat.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// TeamStat 关联
TeamStat.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Notice 关联
Notice.belongsTo(User, { foreignKey: 'publisherId', as: 'publisher' });

// MatchQuarter 关联
MatchQuarter.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

// MatchParticipant 关联
MatchParticipant.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
MatchParticipant.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
MatchParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Season 关联
Season.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Season.hasMany(Match, { foreignKey: 'seasonId', as: 'matches' });

// Achievement 关联
Achievement.hasMany(UserAchievement, { foreignKey: 'achievementId', as: 'userAchievements' });

// UserAchievement 关联
UserAchievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId', as: 'achievement' });
UserAchievement.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
UserAchievement.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

// Notification 关联
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ====================================
// 导出所有模型
// ====================================
module.exports = {
  User,
  Permission,
  Team,
  TeamMember,
  TeamReshuffle,
  DraftPick,
  Match,
  Registration,
  Lineup,
  MatchEvent,
  MatchResult,
  MatchQuarter,
  MatchParticipant,
  PlayerStat,
  PlayerTeamStat,
  TeamStat,
  Notice,
  Season,
  Achievement,
  UserAchievement,
  Notification
};
