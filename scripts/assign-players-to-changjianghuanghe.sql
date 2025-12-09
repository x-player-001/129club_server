-- 将剩余正式队员分配到新赛季的长江黄河队
-- 新赛季长江黄河队ID: 670ff619-c5b7-4d88-9e1b-31d5efde5ba5

-- 1. 更新球员的当前队伍
UPDATE users SET current_team_id = '670ff619-c5b7-4d88-9e1b-31d5efde5ba5'
WHERE id IN (
  '9276f9f0-2df8-4db8-9d87-88f6e77f56d7', -- 邹可 (0号)
  '8cf4f261-5ddb-446b-9064-dacbe9c59f1f', -- 赫南德斯 (3号)
  '9c0ccbee-c7a4-4da5-9147-7e117f9eb16a', -- 陶晴川 (4号)
  '28279967-d68a-45d3-93aa-1887554b2eb3', -- 黄儒学 (6号)
  '370f143c-17fe-4df4-b2d6-f75ed4a97a99', -- 张鸿毅 (7号)
  'fc5f3bf4-bcaf-4a07-a529-28c6cf6f622a', -- 何骏 (9号)
  'd79a0e39-d5cc-41a0-afac-ae59da779797', -- 余信 (12号)
  '26c50a79-562c-4ca6-b156-45023eee3c94', -- 郑彤 (13号)
  'd8d70e63-fe1b-4a73-9b1c-93d68d259e99', -- 徐翔 (14号)
  'd00e587b-de8f-44d5-b716-9d7860266be6', -- 杨文华 (17号)
  '8cd7500c-c95e-4f3e-b776-c9bfaa5c0235', -- 范然 (18号)
  '313be62b-e1af-4a0a-ad93-898c801accea', -- 徐骞 (20号)
  '1f8b12ed-deef-46de-8530-1fa1c8fd2f12', -- 李强 (24号)
  '108f7973-6baa-47ae-8138-139723ad1eb5', -- 何锐 (31号)
  '180d92e2-5a13-450e-97ea-9e19283c860b', -- 庞卓 (34号)
  '003d0cec-2665-4655-82aa-198784fd2886', -- 向开心 (47号)
  '71d7ab1d-1674-4f0f-8a81-d0348f45ed83', -- 陈皓 (49号)
  'a9a4f518-9b49-4120-b008-54b3f7035783', -- 小薛 (77号)
  '78e6a8de-20dc-4560-b567-a054b04237b5', -- 朱荣峥 (81号)
  '63fe6ebf-4360-4840-a567-2b46d7237bf9', -- 周帅 (96号)
  '6a1ea615-5f87-4e6a-bc3a-214ee9a48646'  -- 刘少豪 (101号)
);

-- 2. 在 team_members 表中添加成员记录
INSERT INTO team_members (id, team_id, user_id, role, is_active, joined_at)
VALUES
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '9276f9f0-2df8-4db8-9d87-88f6e77f56d7', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '8cf4f261-5ddb-446b-9064-dacbe9c59f1f', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '9c0ccbee-c7a4-4da5-9147-7e117f9eb16a', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '28279967-d68a-45d3-93aa-1887554b2eb3', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '370f143c-17fe-4df4-b2d6-f75ed4a97a99', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', 'fc5f3bf4-bcaf-4a07-a529-28c6cf6f622a', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', 'd79a0e39-d5cc-41a0-afac-ae59da779797', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '26c50a79-562c-4ca6-b156-45023eee3c94', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', 'd8d70e63-fe1b-4a73-9b1c-93d68d259e99', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', 'd00e587b-de8f-44d5-b716-9d7860266be6', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '8cd7500c-c95e-4f3e-b776-c9bfaa5c0235', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '313be62b-e1af-4a0a-ad93-898c801accea', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '1f8b12ed-deef-46de-8530-1fa1c8fd2f12', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '108f7973-6baa-47ae-8138-139723ad1eb5', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '180d92e2-5a13-450e-97ea-9e19283c860b', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '003d0cec-2665-4655-82aa-198784fd2886', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '71d7ab1d-1674-4f0f-8a81-d0348f45ed83', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', 'a9a4f518-9b49-4120-b008-54b3f7035783', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '78e6a8de-20dc-4560-b567-a054b04237b5', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '63fe6ebf-4360-4840-a567-2b46d7237bf9', 'member', 1, NOW()),
  (UUID(), '670ff619-c5b7-4d88-9e1b-31d5efde5ba5', '6a1ea615-5f87-4e6a-bc3a-214ee9a48646', 'member', 1, NOW());

-- 3. 查询新赛季两个队伍的人数统计
SELECT t.name as team_name, COUNT(tm.id) as member_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = 1
WHERE t.season_id = 'b0a385cd-1aef-4173-9bf2-1d4ac20a03ee'
GROUP BY t.id, t.name
ORDER BY t.name;

-- 4. 验证所有正式队员都已分配到新赛季队伍
SELECT
  CASE
    WHEN current_team_id = '71c88b57-9492-473f-ac5d-4930f27bf621' THEN '嘉陵摩托'
    WHEN current_team_id = '670ff619-c5b7-4d88-9e1b-31d5efde5ba5' THEN '长江黄河'
    ELSE '未分配'
  END as team_status,
  COUNT(*) as player_count
FROM users
WHERE member_type = 'regular' AND status = 'active'
GROUP BY
  CASE
    WHEN current_team_id = '71c88b57-9492-473f-ac5d-4930f27bf621' THEN '嘉陵摩托'
    WHEN current_team_id = '670ff619-c5b7-4d88-9e1b-31d5efde5ba5' THEN '长江黄河'
    ELSE '未分配'
  END;
