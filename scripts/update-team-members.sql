-- ================================================================
-- 更新第一届两江超级联赛球员队伍信息
-- 根据 tests/confirmed_players.json 更新 users 表和 team_members 表
-- ================================================================

-- 设置变量
SET @team_jialingmotuo_id = 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3';  -- 嘉陵摩托
SET @team_changjianghuanghe_id = '281a79c2-e10a-4bfa-8dc8-def0b7b7580a';  -- 长江黄河
SET @season = '第一届两江超级联赛';

-- ================================================================
-- 第一步：清理可能的重复数据
-- ================================================================
SELECT '=== 清理重复数据 ===' AS '';

-- 删除重复的 team_members 记录（保留最早的一条）
DELETE tm1 FROM team_members tm1
INNER JOIN team_members tm2
WHERE tm1.user_id = tm2.user_id
  AND tm1.team_id = tm2.team_id
  AND tm1.joined_at > tm2.joined_at;

SELECT CONCAT('清理了重复记录') AS '';

-- ================================================================
-- 第二步：更新 users 表的 current_team_id
-- ================================================================
SELECT '=== 更新 users 表 ===' AS '';

-- 嘉陵摩托队员 (16人)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '407b88e4-d9cf-4c78-bff5-85e4fa868eca';  -- 曾鹏
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '277dc273-6b68-4d68-8414-3f2672278a6e';  -- 李洪胜 (洪胜)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '9bb0beb2-1810-466e-9e60-713a82f2c6df';  -- 黄波
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '37a97715-d228-479b-a032-e04e24b43ae7';  -- 马培才 (老马)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '21a35430-9b03-4adf-9ac1-be66f1aad476';  -- 施毅 (毅)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '6a1ea615-5f87-4e6a-bc3a-214ee9a48646';  -- 王凌云 (101)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '84e2f056-3854-41e6-9941-25f9a428fcda';  -- 杨涛
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '370f143c-17fe-4df4-b2d6-f75ed4a97a99';  -- 张海川 (海川/川哥)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = 'fc5f3bf4-bcaf-4a07-a529-28c6cf6f622a';  -- 张欣
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '71d7ab1d-1674-4f0f-8a81-d0348f45ed83';  -- 廖鹏
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = 'd00e587b-de8f-44d5-b716-9d7860266be6';  -- 杨文华
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = 'cef30ce9-504f-48fe-9bee-b6c66b61db77';  -- 覃文波
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = 'e18ad310-339b-48b4-8745-58630b87ba3d';  -- 蒲海瑞 (海瑞)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '108f7973-6baa-47ae-8138-139723ad1eb5';  -- 王鑫 (有时借到长江队)
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = 'd8d70e63-fe1b-4a73-9b1c-93d68d259e99';  -- 徐翔
UPDATE users SET current_team_id = @team_jialingmotuo_id WHERE id = '942b0614-06e4-4e35-acd8-52f806a9a5c7';  -- 刘立希 (小刘)

-- 长江黄河队员 (10人)
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '8cf4f261-5ddb-446b-9064-dacbe9c59f1f';  -- 张正祥 (小黑)
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '1ab26cea-e054-4500-a4a9-14b9b82239ad';  -- 房光宇 (小房)
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '7dda9b5f-62ca-4e98-a44d-943cb982c684';  -- 罗阳
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '7fbeef0d-dd93-457b-a259-16e869430e28';  -- 曹枫 (曹老板)
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '41097aab-54bd-4800-84cf-f79e8f7d3d2b';  -- 邱帅
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '7ac814ea-1d64-4878-a68e-cbba2cf028e8';  -- 朱静
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '09f94250-a533-490b-bea7-295e2b128737';  -- 王清亮 (清亮)
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '8cd7500c-c95e-4f3e-b776-c9bfaa5c0235';  -- 陈然
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '8cf5f4ad-3159-41e2-942f-b77804afe972';  -- 李云鹏 (云鹏)
UPDATE users SET current_team_id = @team_changjianghuanghe_id WHERE id = '9c0ccbee-c7a4-4da5-9147-7e117f9eb16a';  -- 孙福临 (福子)

SELECT 'users 表更新完成' AS '';

-- ================================================================
-- 第三步：插入 team_members 表（如果不存在则插入）
-- 使用子查询检查是否已存在，避免重复
-- ================================================================
SELECT '=== 更新 team_members 表 ===' AS '';

-- 嘉陵摩托队员
INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '407b88e4-d9cf-4c78-bff5-85e4fa868eca', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '407b88e4-d9cf-4c78-bff5-85e4fa868eca' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '277dc273-6b68-4d68-8414-3f2672278a6e', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '277dc273-6b68-4d68-8414-3f2672278a6e' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '9bb0beb2-1810-466e-9e60-713a82f2c6df', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '9bb0beb2-1810-466e-9e60-713a82f2c6df' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '37a97715-d228-479b-a032-e04e24b43ae7', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '37a97715-d228-479b-a032-e04e24b43ae7' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '21a35430-9b03-4adf-9ac1-be66f1aad476', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '21a35430-9b03-4adf-9ac1-be66f1aad476' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '6a1ea615-5f87-4e6a-bc3a-214ee9a48646', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '6a1ea615-5f87-4e6a-bc3a-214ee9a48646' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '84e2f056-3854-41e6-9941-25f9a428fcda', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '84e2f056-3854-41e6-9941-25f9a428fcda' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '370f143c-17fe-4df4-b2d6-f75ed4a97a99', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '370f143c-17fe-4df4-b2d6-f75ed4a97a99' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), 'fc5f3bf4-bcaf-4a07-a529-28c6cf6f622a', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = 'fc5f3bf4-bcaf-4a07-a529-28c6cf6f622a' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '71d7ab1d-1674-4f0f-8a81-d0348f45ed83', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '71d7ab1d-1674-4f0f-8a81-d0348f45ed83' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), 'd00e587b-de8f-44d5-b716-9d7860266be6', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = 'd00e587b-de8f-44d5-b716-9d7860266be6' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), 'cef30ce9-504f-48fe-9bee-b6c66b61db77', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = 'cef30ce9-504f-48fe-9bee-b6c66b61db77' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), 'e18ad310-339b-48b4-8745-58630b87ba3d', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = 'e18ad310-339b-48b4-8745-58630b87ba3d' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '108f7973-6baa-47ae-8138-139723ad1eb5', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '108f7973-6baa-47ae-8138-139723ad1eb5' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), 'd8d70e63-fe1b-4a73-9b1c-93d68d259e99', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = 'd8d70e63-fe1b-4a73-9b1c-93d68d259e99' AND team_id = @team_jialingmotuo_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '942b0614-06e4-4e35-acd8-52f806a9a5c7', @team_jialingmotuo_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '942b0614-06e4-4e35-acd8-52f806a9a5c7' AND team_id = @team_jialingmotuo_id);

-- 长江黄河队员
INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '8cf4f261-5ddb-446b-9064-dacbe9c59f1f', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '8cf4f261-5ddb-446b-9064-dacbe9c59f1f' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '1ab26cea-e054-4500-a4a9-14b9b82239ad', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '1ab26cea-e054-4500-a4a9-14b9b82239ad' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '7dda9b5f-62ca-4e98-a44d-943cb982c684', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '7dda9b5f-62ca-4e98-a44d-943cb982c684' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '7fbeef0d-dd93-457b-a259-16e869430e28', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '7fbeef0d-dd93-457b-a259-16e869430e28' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '41097aab-54bd-4800-84cf-f79e8f7d3d2b', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '41097aab-54bd-4800-84cf-f79e8f7d3d2b' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '7ac814ea-1d64-4878-a68e-cbba2cf028e8', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '7ac814ea-1d64-4878-a68e-cbba2cf028e8' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '09f94250-a533-490b-bea7-295e2b128737', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '09f94250-a533-490b-bea7-295e2b128737' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '8cd7500c-c95e-4f3e-b776-c9bfaa5c0235', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '8cd7500c-c95e-4f3e-b776-c9bfaa5c0235' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '8cf5f4ad-3159-41e2-942f-b77804afe972', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '8cf5f4ad-3159-41e2-942f-b77804afe972' AND team_id = @team_changjianghuanghe_id);

INSERT INTO team_members (id, user_id, team_id, role, is_active, joined_at)
SELECT UUID(), '9c0ccbee-c7a4-4da5-9147-7e117f9eb16a', @team_changjianghuanghe_id, 'member', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = '9c0ccbee-c7a4-4da5-9147-7e117f9eb16a' AND team_id = @team_changjianghuanghe_id);

SELECT 'team_members 表更新完成' AS '';

-- ================================================================
-- 第四步：验证更新结果
-- ================================================================
SELECT '=== 更新结果验证 ===' AS '';

-- 查看嘉陵摩托队员
SELECT '嘉陵摩托队员：' AS '';
SELECT u.real_name, u.nickname, t.name AS team_name
FROM users u
LEFT JOIN teams t ON u.current_team_id = t.id
WHERE u.current_team_id = @team_jialingmotuo_id
ORDER BY u.real_name;

-- 查看长江黄河队员
SELECT '长江黄河队员：' AS '';
SELECT u.real_name, u.nickname, t.name AS team_name
FROM users u
LEFT JOIN teams t ON u.current_team_id = t.id
WHERE u.current_team_id = @team_changjianghuanghe_id
ORDER BY u.real_name;

-- 查看 team_members 表记录数
SELECT '=== team_members 表统计 ===' AS '';
SELECT
    t.name AS team_name,
    COUNT(*) AS member_count
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
WHERE tm.is_active = TRUE
GROUP BY t.id, t.name;

-- 完成提示
SELECT '=== 更新完成 ===' AS '';
SELECT
    '嘉陵摩托' AS team,
    COUNT(*) AS updated_count
FROM users
WHERE current_team_id = @team_jialingmotuo_id
UNION ALL
SELECT
    '长江黄河' AS team,
    COUNT(*) AS updated_count
FROM users
WHERE current_team_id = @team_changjianghuanghe_id;
