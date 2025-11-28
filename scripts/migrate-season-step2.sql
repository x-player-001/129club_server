-- 第二步：删除旧字段，重命名新字段，添加外键约束

-- 1. teams 表
ALTER TABLE teams DROP INDEX idx_season;
ALTER TABLE teams DROP COLUMN season;
ALTER TABLE teams CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';
ALTER TABLE teams ADD CONSTRAINT fk_teams_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE teams ADD INDEX idx_season (season);

-- 2. team_stats 表
ALTER TABLE team_stats DROP INDEX idx_season;
ALTER TABLE team_stats DROP COLUMN season;
ALTER TABLE team_stats CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';
ALTER TABLE team_stats ADD CONSTRAINT fk_team_stats_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE team_stats ADD INDEX idx_season (season);

-- 3. player_team_stats 表
ALTER TABLE player_team_stats DROP INDEX uk_user_team_season;
ALTER TABLE player_team_stats DROP INDEX idx_team_season;
ALTER TABLE player_team_stats DROP COLUMN season;
ALTER TABLE player_team_stats CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';
ALTER TABLE player_team_stats ADD CONSTRAINT fk_player_team_stats_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE player_team_stats ADD UNIQUE INDEX uk_user_team_season (user_id, team_id, season);
ALTER TABLE player_team_stats ADD INDEX idx_team_season (team_id, season);

-- 4. team_reshuffles 表
ALTER TABLE team_reshuffles DROP INDEX idx_season;
ALTER TABLE team_reshuffles DROP COLUMN season;
ALTER TABLE team_reshuffles CHANGE COLUMN season_id season VARCHAR(36) NOT NULL COMMENT '赛季ID';
ALTER TABLE team_reshuffles ADD CONSTRAINT fk_team_reshuffles_season FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE team_reshuffles ADD INDEX idx_season (season);

-- 验证最终结果
SELECT 'Migration completed!' as status;
SHOW CREATE TABLE teams;
SHOW CREATE TABLE team_stats;
SHOW CREATE TABLE player_team_stats;
SHOW CREATE TABLE team_reshuffles;
