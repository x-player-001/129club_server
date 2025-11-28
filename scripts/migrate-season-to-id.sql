-- 迁移脚本：将所有表的 season (name) 字段改为 season_id (UUID)
-- 执行前请备份数据库！

-- 1. 为 teams 表添加新的 season_id 字段
ALTER TABLE teams
ADD COLUMN season_id VARCHAR(36) NULL COMMENT '赛季ID' AFTER season;

-- 2. 根据 season name 填充 season_id
UPDATE teams t
JOIN seasons s ON t.season = s.name
SET t.season_id = s.id;

-- 3. 为 team_stats 表添加新的 season_id 字段
ALTER TABLE team_stats
ADD COLUMN season_id VARCHAR(36) NULL COMMENT '赛季ID' AFTER season;

-- 4. 根据 season name 填充 season_id
UPDATE team_stats ts
JOIN seasons s ON ts.season = s.name
SET ts.season_id = s.id;

-- 5. 为 player_team_stats 表添加新的 season_id 字段
ALTER TABLE player_team_stats
ADD COLUMN season_id VARCHAR(36) NULL COMMENT '赛季ID' AFTER season;

-- 6. 根据 season name 填充 season_id
UPDATE player_team_stats pts
JOIN seasons s ON pts.season = s.name
SET pts.season_id = s.id;

-- 7. 为 team_reshuffles 表添加新的 season_id 字段
ALTER TABLE team_reshuffles
ADD COLUMN season_id VARCHAR(36) NULL COMMENT '赛季ID' AFTER season;

-- 8. 根据 season name 填充 season_id
UPDATE team_reshuffles tr
JOIN seasons s ON tr.season = s.name
SET tr.season_id = s.id;

-- 验证数据迁移结果
SELECT 'teams' as table_name, COUNT(*) as total, COUNT(season_id) as migrated FROM teams
UNION ALL
SELECT 'team_stats', COUNT(*), COUNT(season_id) FROM team_stats
UNION ALL
SELECT 'player_team_stats', COUNT(*), COUNT(season_id) FROM player_team_stats
UNION ALL
SELECT 'team_reshuffles', COUNT(*), COUNT(season_id) FROM team_reshuffles;

-- 如果验证通过，执行以下步骤删除旧字段并重命名

-- 9. 删除 teams 表的旧 season 字段和唯一索引
ALTER TABLE teams DROP INDEX uk_name_season;
ALTER TABLE teams DROP COLUMN season;
ALTER TABLE teams CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';

-- 10. 添加外键约束和索引
ALTER TABLE teams
ADD CONSTRAINT fk_teams_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE teams ADD UNIQUE INDEX uk_name_season (name, season);

-- 11. 删除 team_stats 表的旧 season 字段和唯一索引
ALTER TABLE team_stats DROP INDEX uk_team_season;
ALTER TABLE team_stats DROP COLUMN season;
ALTER TABLE team_stats CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';

-- 12. 添加外键约束和索引
ALTER TABLE team_stats
ADD CONSTRAINT fk_team_stats_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE team_stats ADD UNIQUE INDEX uk_team_season (team_id, season);

-- 13. 删除 player_team_stats 表的旧 season 字段和唯一索引
ALTER TABLE player_team_stats DROP INDEX uk_user_team_season;
ALTER TABLE player_team_stats DROP COLUMN season;
ALTER TABLE player_team_stats CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';

-- 14. 添加外键约束和索引
ALTER TABLE player_team_stats
ADD CONSTRAINT fk_player_team_stats_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE player_team_stats ADD UNIQUE INDEX uk_user_team_season (user_id, team_id, season);
ALTER TABLE player_team_stats DROP INDEX idx_team_season;
ALTER TABLE player_team_stats ADD INDEX idx_team_season (team_id, season);

-- 15. 删除 team_reshuffles 表的旧 season 字段
ALTER TABLE team_reshuffles DROP INDEX idx_season;
ALTER TABLE team_reshuffles DROP COLUMN season;
ALTER TABLE team_reshuffles CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';

-- 16. 添加外键约束和索引
ALTER TABLE team_reshuffles
ADD CONSTRAINT fk_team_reshuffles_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE team_reshuffles ADD INDEX idx_season (season);

-- 完成！现在所有表都使用 season (UUID) 而不是 season (name)
