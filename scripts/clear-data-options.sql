-- ============================================
-- 清空数据库数据 - 分级清空选项
-- ============================================

-- ============================================
-- 选项1: 只清空用户数据（最小影响）
-- ============================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE `user_achievements`;
-- TRUNCATE TABLE `notifications`;
-- TRUNCATE TABLE `users`;
-- TRUNCATE TABLE `team_members`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 选项2: 只清空比赛数据
-- ============================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE `match_events`;
-- TRUNCATE TABLE `match_participants`;
-- TRUNCATE TABLE `match_quarters`;
-- TRUNCATE TABLE `match_results`;
-- TRUNCATE TABLE `registrations`;
-- TRUNCATE TABLE `matches`;
-- TRUNCATE TABLE `lineups`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 选项3: 只清空统计数据
-- ============================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE `player_stats`;
-- TRUNCATE TABLE `player_team_stats`;
-- TRUNCATE TABLE `team_stats`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 选项4: 清空所有业务数据（保留配置）★ 推荐
-- 清空：用户、比赛、统计
-- 保留：队伍、赛季、成就、公告
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- 用户数据
TRUNCATE TABLE `user_achievements`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `users`;

-- 比赛数据
TRUNCATE TABLE `match_events`;
TRUNCATE TABLE `match_participants`;
TRUNCATE TABLE `match_quarters`;
TRUNCATE TABLE `match_results`;
TRUNCATE TABLE `registrations`;
TRUNCATE TABLE `matches`;
TRUNCATE TABLE `lineups`;

-- 统计数据
TRUNCATE TABLE `player_stats`;
TRUNCATE TABLE `player_team_stats`;
TRUNCATE TABLE `team_stats`;

-- 队伍关系数据
TRUNCATE TABLE `team_members`;
TRUNCATE TABLE `team_reshuffles`;
TRUNCATE TABLE `draft_picks`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 验证清空结果
-- ============================================
SELECT
    '业务数据' AS category,
    'users' AS table_name,
    COUNT(*) AS count
FROM users

UNION ALL SELECT '业务数据', 'matches', COUNT(*) FROM matches
UNION ALL SELECT '业务数据', 'registrations', COUNT(*) FROM registrations
UNION ALL SELECT '业务数据', 'player_stats', COUNT(*) FROM player_stats
UNION ALL SELECT '业务数据', 'team_members', COUNT(*) FROM team_members

UNION ALL SELECT '配置数据', 'teams', COUNT(*) FROM teams
UNION ALL SELECT '配置数据', 'seasons', COUNT(*) FROM seasons
UNION ALL SELECT '配置数据', 'achievements', COUNT(*) FROM achievements
UNION ALL SELECT '配置数据', 'notices', COUNT(*) FROM notices

ORDER BY category, table_name;
