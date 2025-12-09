-- 删除新赛季刚创建的比赛
-- 比赛ID: 8d34cc58-eadd-49a0-844e-e9232d3efec2
-- 赛季ID: b0a385cd-1aef-4173-9bf2-1d4ac20a03ee
-- 创建时间: 2025-12-10 00:23:56

-- 安全检查：确认要删除的比赛
SELECT id, title, season_id, status, created_at
FROM matches
WHERE id = '8d34cc58-eadd-49a0-844e-e9232d3efec2';

-- 1. 删除比赛相关的小节数据
DELETE FROM match_quarters WHERE match_id = '8d34cc58-eadd-49a0-844e-e9232d3efec2';

-- 2. 删除比赛参与者数据
DELETE FROM match_participants WHERE match_id = '8d34cc58-eadd-49a0-844e-e9232d3efec2';

-- 3. 删除比赛结果数据（如果有）
DELETE FROM match_results WHERE match_id = '8d34cc58-eadd-49a0-844e-e9232d3efec2';

-- 4. 删除比赛记录
DELETE FROM matches WHERE id = '8d34cc58-eadd-49a0-844e-e9232d3efec2';

-- 验证删除结果
SELECT COUNT(*) as remaining_new_season_matches
FROM matches
WHERE season_id = 'b0a385cd-1aef-4173-9bf2-1d4ac20a03ee';

-- 验证历史数据未受影响（第一赛季应该有10场比赛）
SELECT COUNT(*) as old_season_matches
FROM matches
WHERE season_id = 'ed6cba6b-5e8e-4985-a674-e2d8701a1171';
