-- ============================================
-- 插入测试用户并分配到队伍
-- 说明：创建测试用户并将其加入现有队伍，同时更新关联表
-- ============================================

-- 获取现有队伍ID（长江飞鹤和鸡蛋魔图）
SET @team1_id = '281a79c2-e10a-4bfa-8dc8-def0b7b7580a'; -- 长江飞鹤
SET @team2_id = 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3'; -- 鸡蛋魔图

-- ============================================
-- 1. 插入测试用户到 users 表
-- ============================================

-- 长江飞鹤队员（6人）
INSERT INTO `users` (`id`, `openid`, `nickname`, `real_name`, `avatar`, `phone`, `position`, `jersey_number`, `left_foot_skill`, `right_foot_skill`, `role`, `status`, `current_team_id`, `join_date`, `member_type`)
VALUES
  ('user-test-01', 'test_openid_01', '张三', '张三', '/static/avatars/default1.png', '13800138001', 'ST', 10, 3, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-02', 'test_openid_02', '李四', '李四', '/static/avatars/default2.png', '13800138002', 'CM', 8, 4, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-03', 'test_openid_03', '王五', '王五', '/static/avatars/default3.png', '13800138003', 'CB', 5, 5, 3, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-04', 'test_openid_04', '赵六', '赵六', '/static/avatars/default4.png', '13800138004', 'LW', 7, 3, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-05', 'test_openid_05', '孙七', '孙七', '/static/avatars/default5.png', '13800138005', 'GK', 1, 4, 4, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-06', 'test_openid_06', '周八', '周八', '/static/avatars/default6.png', '13800138006', 'RB', 2, 3, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular');

-- 鸡蛋魔图队员（6人）
INSERT INTO `users` (`id`, `openid`, `nickname`, `real_name`, `avatar`, `phone`, `position`, `jersey_number`, `left_foot_skill`, `right_foot_skill`, `role`, `status`, `current_team_id`, `join_date`, `member_type`)
VALUES
  ('user-test-07', 'test_openid_07', '吴九', '吴九', '/static/avatars/default7.png', '13800138007', 'ST', 9, 5, 4, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-08', 'test_openid_08', '郑十', '郑十', '/static/avatars/default8.png', '13800138008', 'CAM', 10, 3, 5, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-09', 'test_openid_09', '钱九', '钱九', '/static/avatars/default9.png', '13800138009', 'CB', 4, 4, 5, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-10', 'test_openid_10', '陈十', '陈十', '/static/avatars/default10.png', '13800138010', 'RW', 11, 5, 3, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-11', 'test_openid_11', '刘一', '刘一', '/static/avatars/default11.png', '13800138011', 'GK', 1, 4, 4, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-12', 'test_openid_12', '黄二', '黄二', '/static/avatars/default12.png', '13800138012', 'LB', 3, 5, 3, 'member', 'active', @team2_id, '2025-10-01', 'regular');

-- ============================================
-- 2. 插入 team_members 关联表（用户加入队伍）
-- ============================================

-- 长江飞鹤队员
INSERT INTO `team_members` (`id`, `team_id`, `user_id`, `joined_at`, `role`, `is_active`)
VALUES
  (UUID(), @team1_id, 'user-test-01', NOW(), 'captain', 1),  -- 张三为队长
  (UUID(), @team1_id, 'user-test-02', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-03', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-04', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-05', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-06', NOW(), 'member', 1);

-- 鸡蛋魔图队员
INSERT INTO `team_members` (`id`, `team_id`, `user_id`, `joined_at`, `role`, `is_active`)
VALUES
  (UUID(), @team2_id, 'user-test-07', NOW(), 'captain', 1),  -- 吴九为队长
  (UUID(), @team2_id, 'user-test-08', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-09', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-10', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-11', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-12', NOW(), 'member', 1);

-- ============================================
-- 3. 更新 teams 表的队长信息
-- ============================================

UPDATE `teams` SET `captain_id` = 'user-test-01' WHERE `id` = @team1_id;
UPDATE `teams` SET `captain_id` = 'user-test-07' WHERE `id` = @team2_id;

-- ============================================
-- 4. 初始化 player_team_stats 表（球员队伍统计）
-- ============================================

-- 长江飞鹤队员统计
INSERT INTO `player_team_stats` (`id`, `user_id`, `team_id`, `season`, `matches_played`, `wins`, `draws`, `losses`, `goals`, `assists`, `yellow_cards`, `red_cards`, `mvp_count`)
VALUES
  (UUID(), 'user-test-01', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-02', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-03', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-04', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-05', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-06', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- 鸡蛋魔图队员统计
INSERT INTO `player_team_stats` (`id`, `user_id`, `team_id`, `season`, `matches_played`, `wins`, `draws`, `losses`, `goals`, `assists`, `yellow_cards`, `red_cards`, `mvp_count`)
VALUES
  (UUID(), 'user-test-07', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-08', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-09', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-10', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-11', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-12', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- ============================================
-- 5. 初始化 player_stats 表（球员总统计）
-- ============================================

INSERT INTO `player_stats` (`id`, `user_id`, `matches_played`, `wins`, `draws`, `losses`, `goals`, `assists`, `yellow_cards`, `red_cards`, `mvp_count`, `attendance_rate`, `win_rate`)
VALUES
  (UUID(), 'user-test-01', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-02', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-03', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-05', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-07', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-09', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-10', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-11', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- ============================================
-- 6. 给测试用户分配基础权限
-- ============================================

INSERT INTO `permissions` (`id`, `user_id`, `resource`, `action`, `granted_at`)
SELECT UUID(), id, 'match', 'create', NOW() FROM users WHERE id LIKE 'user-test-%';

INSERT INTO `permissions` (`id`, `user_id`, `resource`, `action`, `granted_at`)
SELECT UUID(), id, 'team', 'view', NOW() FROM users WHERE id LIKE 'user-test-%';

-- ============================================
-- 验证数据
-- ============================================

SELECT '=== 测试用户列表 ===' as '';
SELECT id, nickname, real_name, current_team_id, position, jersey_number FROM users WHERE id LIKE 'user-test-%';

SELECT '=== 队伍成员统计 ===' as '';
SELECT t.name, COUNT(tm.user_id) as member_count, t.captain_id
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.id IN (@team1_id, @team2_id)
GROUP BY t.id, t.name, t.captain_id;

SELECT '=== 长江飞鹤队员 ===' as '';
SELECT u.nickname, u.real_name, u.position, u.jersey_number, tm.role
FROM users u
JOIN team_members tm ON u.id = tm.user_id
WHERE tm.team_id = @team1_id;

SELECT '=== 鸡蛋魔图队员 ===' as '';
SELECT u.nickname, u.real_name, u.position, u.jersey_number, tm.role
FROM users u
JOIN team_members tm ON u.id = tm.user_id
WHERE tm.team_id = @team2_id;
