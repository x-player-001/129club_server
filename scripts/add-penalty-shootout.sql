-- ============================================
-- 添加点球大战功能
-- 说明：在 match_results 表添加点球大战相关字段
-- ============================================

-- 添加点球大战字段
ALTER TABLE `match_results`
ADD COLUMN `penalty_shootout` TINYINT(1) DEFAULT 0 COMMENT '是否进行点球大战(0=否, 1=是)' AFTER `winner_team_id`,
ADD COLUMN `team1_penalty_score` INT UNSIGNED DEFAULT NULL COMMENT '队伍1点球得分' AFTER `penalty_shootout`,
ADD COLUMN `team2_penalty_score` INT UNSIGNED DEFAULT NULL COMMENT '队伍2点球得分' AFTER `team1_penalty_score`,
ADD COLUMN `penalty_winner_team_id` VARCHAR(36) DEFAULT NULL COMMENT '点球大战获胜队伍ID' AFTER `team2_penalty_score`;

-- 添加外键约束（点球获胜队伍）
ALTER TABLE `match_results`
ADD CONSTRAINT `fk_penalty_winner_team`
FOREIGN KEY (`penalty_winner_team_id`)
REFERENCES `teams`(`id`)
ON DELETE SET NULL;

-- 验证字段
SHOW COLUMNS FROM match_results LIKE '%penalty%';
