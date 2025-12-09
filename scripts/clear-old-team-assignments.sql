-- 清除所有还指向旧赛季队伍的 current_team_id
-- 这些队员（主要是临时队员）未被分配到新赛季队伍

-- 查看要更新的队员
SELECT u.id, u.real_name, u.nickname, u.member_type, t.name as old_team_name
FROM users u
LEFT JOIN teams t ON u.current_team_id = t.id
WHERE u.status='active'
  AND u.current_team_id IS NOT NULL
  AND u.current_team_id NOT IN (
    '71c88b57-9492-473f-ac5d-4930f27bf621',  -- 新赛季嘉陵摩托
    '670ff619-c5b7-4d88-9e1b-31d5efde5ba5'   -- 新赛季长江黄河
  );

-- 更新 current_team_id 为 NULL
UPDATE users
SET current_team_id = NULL
WHERE status='active'
  AND current_team_id IS NOT NULL
  AND current_team_id NOT IN (
    '71c88b57-9492-473f-ac5d-4930f27bf621',  -- 新赛季嘉陵摩托
    '670ff619-c5b7-4d88-9e1b-31d5efde5ba5'   -- 新赛季长江黄河
  );

-- 验证更新结果：统计各队伍人数
SELECT
  CASE
    WHEN u.current_team_id = '71c88b57-9492-473f-ac5d-4930f27bf621' THEN '嘉陵摩托(新)'
    WHEN u.current_team_id = '670ff619-c5b7-4d88-9e1b-31d5efde5ba5' THEN '长江黄河(新)'
    WHEN u.current_team_id IS NULL THEN '未分配'
    ELSE '其他旧队伍'
  END as team_status,
  u.member_type,
  COUNT(*) as player_count
FROM users u
WHERE u.status = 'active'
GROUP BY
  CASE
    WHEN u.current_team_id = '71c88b57-9492-473f-ac5d-4930f27bf621' THEN '嘉陵摩托(新)'
    WHEN u.current_team_id = '670ff619-c5b7-4d88-9e1b-31d5efde5ba5' THEN '长江黄河(新)'
    WHEN u.current_team_id IS NULL THEN '未分配'
    ELSE '其他旧队伍'
  END,
  u.member_type
ORDER BY team_status, u.member_type;
