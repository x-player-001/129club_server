-- ============================================
-- 清空用户和比赛数据，保留配置数据
-- 保留：teams, seasons, achievements, notices
-- 清空：users, matches, registrations, statistics 等
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. 清空用户相关数据
TRUNCATE TABLE `user_achievements`;
TRUNCATE TABLE `user_visit_logs`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `users`;

-- 2. 清空比赛相关数据
TRUNCATE TABLE `match_events`;
TRUNCATE TABLE `match_participants`;
TRUNCATE TABLE `match_quarters`;
TRUNCATE TABLE `match_results`;
TRUNCATE TABLE `registrations`;
TRUNCATE TABLE `lineups`;
TRUNCATE TABLE `matches`;

-- 3. 清空统计数据
TRUNCATE TABLE `player_stats`;
TRUNCATE TABLE `player_team_stats`;
TRUNCATE TABLE `team_stats`;

-- 4. 清空队伍成员关系（保留队伍本身）
TRUNCATE TABLE `team_members`;
TRUNCATE TABLE `team_reshuffles`;
TRUNCATE TABLE `draft_picks`;

-- 5. 清空权限数据（如果需要）
-- TRUNCATE TABLE `permissions`;

SET FOREIGN_KEY_CHECKS = 1;

-- 验证清空结果
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'user_visit_logs', COUNT(*) FROM user_visit_logs
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'match_events', COUNT(*) FROM match_events
UNION ALL
SELECT 'match_participants', COUNT(*) FROM match_participants
UNION ALL
SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'player_stats', COUNT(*) FROM player_stats
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'seasons', COUNT(*) FROM seasons
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements;
