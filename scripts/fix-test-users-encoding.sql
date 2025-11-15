-- ============================================
-- 修复测试用户编码问题并重新插入
-- ============================================

SET NAMES utf8mb4;

-- 删除所有测试用户相关数据
DELETE FROM match_events WHERE user_id LIKE 'user-test-%';
DELETE FROM match_participants WHERE user_id LIKE 'user-test-%';
DELETE FROM permissions WHERE user_id LIKE 'user-test-%';
DELETE FROM player_stats WHERE user_id LIKE 'user-test-%';
DELETE FROM player_team_stats WHERE user_id LIKE 'user-test-%';
DELETE FROM team_members WHERE user_id LIKE 'user-test-%';
UPDATE teams SET captain_id = NULL WHERE captain_id LIKE 'user-test-%';
DELETE FROM users WHERE id LIKE 'user-test-%';

-- 设置队伍ID
SET @team1_id = '281a79c2-e10a-4bfa-8dc8-def0b7b7580a';
SET @team2_id = 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3';

-- 长江飞鹤队员（6人）
INSERT INTO users (id, openid, nickname, real_name, avatar, phone, position, jersey_number, left_foot_skill, right_foot_skill, role, status, current_team_id, join_date, member_type)
VALUES
  ('user-test-01', 'test_openid_01', '张三', '张三', '/static/avatars/default1.png', '13800138001', 'ST', 10, 3, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-02', 'test_openid_02', '李四', '李四', '/static/avatars/default2.png', '13800138002', 'CM', 8, 4, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-03', 'test_openid_03', '王五', '王五', '/static/avatars/default3.png', '13800138003', 'CB', 5, 5, 3, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-04', 'test_openid_04', '赵六', '赵六', '/static/avatars/default4.png', '13800138004', 'LW', 7, 3, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-05', 'test_openid_05', '孙七', '孙七', '/static/avatars/default5.png', '13800138005', 'GK', 1, 4, 4, 'member', 'active', @team1_id, '2025-10-01', 'regular'),
  ('user-test-06', 'test_openid_06', '周八', '周八', '/static/avatars/default6.png', '13800138006', 'RB', 2, 3, 5, 'member', 'active', @team1_id, '2025-10-01', 'regular');

-- 鸡蛋魔图队员（6人）
INSERT INTO users (id, openid, nickname, real_name, avatar, phone, position, jersey_number, left_foot_skill, right_foot_skill, role, status, current_team_id, join_date, member_type)
VALUES
  ('user-test-07', 'test_openid_07', '吴九', '吴九', '/static/avatars/default7.png', '13800138007', 'ST', 9, 5, 4, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-08', 'test_openid_08', '郑十', '郑十', '/static/avatars/default8.png', '13800138008', 'CAM', 10, 3, 5, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-09', 'test_openid_09', '钱九', '钱九', '/static/avatars/default9.png', '13800138009', 'CB', 4, 4, 5, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-10', 'test_openid_10', '陈十', '陈十', '/static/avatars/default10.png', '13800138010', 'RW', 11, 5, 3, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-11', 'test_openid_11', '刘一', '刘一', '/static/avatars/default11.png', '13800138011', 'GK', 1, 4, 4, 'member', 'active', @team2_id, '2025-10-01', 'regular'),
  ('user-test-12', 'test_openid_12', '黄二', '黄二', '/static/avatars/default12.png', '13800138012', 'LB', 3, 5, 3, 'member', 'active', @team2_id, '2025-10-01', 'regular');

-- 插入 team_members 关联表
INSERT INTO team_members (id, team_id, user_id, joined_at, role, is_active)
VALUES
  (UUID(), @team1_id, 'user-test-01', NOW(), 'captain', 1),
  (UUID(), @team1_id, 'user-test-02', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-03', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-04', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-05', NOW(), 'member', 1),
  (UUID(), @team1_id, 'user-test-06', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-07', NOW(), 'captain', 1),
  (UUID(), @team2_id, 'user-test-08', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-09', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-10', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-11', NOW(), 'member', 1),
  (UUID(), @team2_id, 'user-test-12', NOW(), 'member', 1);

-- 更新队长信息
UPDATE teams SET captain_id = 'user-test-01' WHERE id = @team1_id;
UPDATE teams SET captain_id = 'user-test-07' WHERE id = @team2_id;

-- 初始化 player_team_stats
INSERT INTO player_team_stats (id, user_id, team_id, season, matches_played, wins, draws, losses, goals, assists, yellow_cards, red_cards, mvp_count)
VALUES
  (UUID(), 'user-test-01', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-02', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-03', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-04', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-05', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-06', @team1_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-07', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-08', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-09', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-10', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-11', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0),
  (UUID(), 'user-test-12', @team2_id, '2025', 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- 初始化 player_stats
INSERT INTO player_stats (id, user_id, matches_played, wins, draws, losses, goals, assists, yellow_cards, red_cards, mvp_count, attendance_rate, win_rate)
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

-- 分配基础权限
INSERT INTO permissions (id, user_id, resource, action, granted_at)
SELECT UUID(), id, 'match', 'create', NOW() FROM users WHERE id LIKE 'user-test-%';

INSERT INTO permissions (id, user_id, resource, action, granted_at)
SELECT UUID(), id, 'team', 'view', NOW() FROM users WHERE id LIKE 'user-test-%';

-- 验证结果
SELECT id, nickname, real_name, position, jersey_number FROM users WHERE id LIKE 'user-test-%' ORDER BY id;
