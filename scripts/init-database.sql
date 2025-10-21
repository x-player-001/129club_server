-- ====================================
-- 129俱乐部数据库初始化脚本
-- ====================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS 129club CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE 129club;

-- ====================================
-- 1. 用户表
-- ====================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户ID (UUID)',
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  unionid VARCHAR(100) COMMENT '微信unionid',
  nickname VARCHAR(50) COMMENT '昵称',
  real_name VARCHAR(50) COMMENT '真实姓名',
  avatar VARCHAR(255) COMMENT '头像URL',
  phone VARCHAR(20) COMMENT '手机号',
  jersey_number INT COMMENT '球衣号码',
  position ENUM('GK', 'DF', 'MF', 'FW') COMMENT '场上位置 GK守门员 DF后卫 MF中场 FW前锋',
  role ENUM('super_admin', 'captain', 'member') DEFAULT 'member' COMMENT '角色',
  status ENUM('active', 'inactive', 'leave') DEFAULT 'active' COMMENT '状态',
  current_team_id VARCHAR(36) COMMENT '当前队伍ID',
  join_date DATE COMMENT '加入日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_openid (openid),
  INDEX idx_status (status),
  INDEX idx_team (current_team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ====================================
-- 2. 权限表
-- ====================================
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(36) PRIMARY KEY COMMENT '权限ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  resource VARCHAR(50) NOT NULL COMMENT '资源名称',
  action VARCHAR(20) NOT NULL COMMENT '操作类型 create/read/update/delete',
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',
  granted_by VARCHAR(36) COMMENT '授权人ID',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_resource (resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- ====================================
-- 3. 队伍表
-- ====================================
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(36) PRIMARY KEY COMMENT '队伍ID',
  name VARCHAR(50) NOT NULL COMMENT '队名',
  logo VARCHAR(255) COMMENT '队徽URL',
  captain_id VARCHAR(36) COMMENT '队长ID',
  color VARCHAR(20) COMMENT '队伍主色调',
  season VARCHAR(20) NOT NULL COMMENT '赛季/期数 如2025-S1',
  status ENUM('active', 'disbanded', 'archived') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  disbanded_at TIMESTAMP NULL COMMENT '解散时间',
  created_by VARCHAR(36) COMMENT '创建者ID',
  FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_season (season),
  INDEX idx_status (status),
  INDEX idx_captain (captain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='队伍表';

-- ====================================
-- 4. 队伍成员关系表
-- ====================================
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(36) PRIMARY KEY COMMENT '关系ID',
  team_id VARCHAR(36) NOT NULL COMMENT '队伍ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  role ENUM('captain', 'member') DEFAULT 'member' COMMENT '队内角色',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否在队',
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_team (team_id),
  INDEX idx_user (user_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='队伍成员关系表';

-- ====================================
-- 5. 队伍重组记录表
-- ====================================
CREATE TABLE IF NOT EXISTS team_reshuffles (
  id VARCHAR(36) PRIMARY KEY COMMENT '重组ID',
  season VARCHAR(20) NOT NULL COMMENT '赛季',
  initiator_id VARCHAR(36) NOT NULL COMMENT '发起人ID',
  captain1_id VARCHAR(36) COMMENT '队长1 ID',
  captain2_id VARCHAR(36) COMMENT '队长2 ID',
  team1_id VARCHAR(36) COMMENT '队伍1 ID',
  team2_id VARCHAR(36) COMMENT '队伍2 ID',
  status ENUM('draft_in_progress', 'completed', 'cancelled') DEFAULT 'draft_in_progress' COMMENT '状态',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  FOREIGN KEY (initiator_id) REFERENCES users(id),
  FOREIGN KEY (captain1_id) REFERENCES users(id),
  FOREIGN KEY (captain2_id) REFERENCES users(id),
  FOREIGN KEY (team1_id) REFERENCES teams(id),
  FOREIGN KEY (team2_id) REFERENCES teams(id),
  INDEX idx_season (season),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='队伍重组记录表';

-- ====================================
-- 6. Draft选人记录表
-- ====================================
CREATE TABLE IF NOT EXISTS draft_picks (
  id VARCHAR(36) PRIMARY KEY COMMENT '选人记录ID',
  reshuffle_id VARCHAR(36) NOT NULL COMMENT '重组ID',
  round INT NOT NULL COMMENT '轮次',
  pick_order INT NOT NULL COMMENT '选人顺序',
  captain_id VARCHAR(36) NOT NULL COMMENT '队长ID',
  picked_user_id VARCHAR(36) NOT NULL COMMENT '被选中的用户ID',
  team_id VARCHAR(36) NOT NULL COMMENT '队伍ID',
  picked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '选择时间',
  FOREIGN KEY (reshuffle_id) REFERENCES team_reshuffles(id) ON DELETE CASCADE,
  FOREIGN KEY (captain_id) REFERENCES users(id),
  FOREIGN KEY (picked_user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  INDEX idx_reshuffle (reshuffle_id),
  INDEX idx_round (round)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Draft选人记录表';

-- ====================================
-- 7. 比赛表
-- ====================================
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(36) PRIMARY KEY COMMENT '比赛ID',
  title VARCHAR(100) NOT NULL COMMENT '比赛标题',
  team1_id VARCHAR(36) NOT NULL COMMENT '队伍1 ID',
  team2_id VARCHAR(36) NOT NULL COMMENT '队伍2 ID',
  match_date TIMESTAMP NOT NULL COMMENT '比赛时间',
  location VARCHAR(100) COMMENT '比赛地点',
  status ENUM('upcoming', 'registration', 'lineup_set', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming' COMMENT '比赛状态',
  registration_deadline TIMESTAMP COMMENT '报名截止时间',
  max_players_per_team INT DEFAULT 11 COMMENT '每队最多报名人数',
  created_by VARCHAR(36) COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (team1_id) REFERENCES teams(id),
  FOREIGN KEY (team2_id) REFERENCES teams(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_match_date (match_date),
  INDEX idx_status (status),
  INDEX idx_team1 (team1_id),
  INDEX idx_team2 (team2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛表';

-- ====================================
-- 8. 比赛报名表
-- ====================================
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(36) PRIMARY KEY COMMENT '报名ID',
  match_id VARCHAR(36) NOT NULL COMMENT '比赛ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  team_id VARCHAR(36) NOT NULL COMMENT '队伍ID（报名时所属队伍）',
  status ENUM('registered', 'confirmed', 'cancelled') DEFAULT 'registered' COMMENT '报名状态',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  notes VARCHAR(255) COMMENT '备注',
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  UNIQUE KEY uk_match_user (match_id, user_id),
  INDEX idx_match (match_id),
  INDEX idx_user (user_id),
  INDEX idx_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛报名表';

-- ====================================
-- 9. 比赛阵容表
-- ====================================
CREATE TABLE IF NOT EXISTS lineups (
  id VARCHAR(36) PRIMARY KEY COMMENT '阵容ID',
  match_id VARCHAR(36) NOT NULL COMMENT '比赛ID',
  team_id VARCHAR(36) NOT NULL COMMENT '队伍ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  position ENUM('GK', 'DF', 'MF', 'FW', 'SUB') NOT NULL COMMENT '场上位置',
  jersey_number INT COMMENT '球衣号码',
  is_starter BOOLEAN DEFAULT TRUE COMMENT '是否首发',
  set_by VARCHAR(36) COMMENT '设置者ID（队长）',
  set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '设置时间',
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (set_by) REFERENCES users(id),
  UNIQUE KEY uk_match_team_user (match_id, team_id, user_id),
  INDEX idx_match (match_id),
  INDEX idx_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛阵容表';

-- ====================================
-- 10. 比赛事件表
-- ====================================
CREATE TABLE IF NOT EXISTS match_events (
  id VARCHAR(36) PRIMARY KEY COMMENT '事件ID',
  match_id VARCHAR(36) NOT NULL COMMENT '比赛ID',
  team_id VARCHAR(36) NOT NULL COMMENT '队伍ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  event_type ENUM('goal', 'assist', 'yellow_card', 'red_card', 'substitution_in', 'substitution_out') NOT NULL COMMENT '事件类型',
  minute INT COMMENT '发生时间（分钟）',
  assist_user_id VARCHAR(36) COMMENT '助攻者ID（进球事件）',
  notes VARCHAR(255) COMMENT '备注',
  recorded_by VARCHAR(36) COMMENT '记录者ID',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assist_user_id) REFERENCES users(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  INDEX idx_match (match_id),
  INDEX idx_type (event_type),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛事件表';

-- ====================================
-- 11. 比赛结果表
-- ====================================
CREATE TABLE IF NOT EXISTS match_results (
  id VARCHAR(36) PRIMARY KEY COMMENT '结果ID',
  match_id VARCHAR(36) UNIQUE NOT NULL COMMENT '比赛ID',
  team1_score INT NOT NULL DEFAULT 0 COMMENT '队伍1得分',
  team2_score INT NOT NULL DEFAULT 0 COMMENT '队伍2得分',
  winner_team_id VARCHAR(36) COMMENT '获胜队伍ID',
  mvp_user_id VARCHAR(36) COMMENT 'MVP用户ID',
  summary TEXT COMMENT '比赛总结',
  submitted_by VARCHAR(36) COMMENT '提交者ID',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_team_id) REFERENCES teams(id),
  FOREIGN KEY (mvp_user_id) REFERENCES users(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='比赛结果表';

-- ====================================
-- 12. 球员总体统计表
-- ====================================
CREATE TABLE IF NOT EXISTS player_stats (
  id VARCHAR(36) PRIMARY KEY COMMENT '统计ID',
  user_id VARCHAR(36) UNIQUE NOT NULL COMMENT '用户ID',
  matches_played INT DEFAULT 0 COMMENT '参赛场次',
  wins INT DEFAULT 0 COMMENT '胜场',
  draws INT DEFAULT 0 COMMENT '平局',
  losses INT DEFAULT 0 COMMENT '负场',
  goals INT DEFAULT 0 COMMENT '进球数',
  assists INT DEFAULT 0 COMMENT '助攻数',
  yellow_cards INT DEFAULT 0 COMMENT '黄牌数',
  red_cards INT DEFAULT 0 COMMENT '红牌数',
  mvp_count INT DEFAULT 0 COMMENT 'MVP次数',
  attendance_rate DECIMAL(5,2) DEFAULT 0 COMMENT '出勤率',
  win_rate DECIMAL(5,2) DEFAULT 0 COMMENT '胜率',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goals (goals),
  INDEX idx_assists (assists),
  INDEX idx_mvp (mvp_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球员总体统计表';

-- ====================================
-- 13. 球员队内统计表
-- ====================================
CREATE TABLE IF NOT EXISTS player_team_stats (
  id VARCHAR(36) PRIMARY KEY COMMENT '统计ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  team_id VARCHAR(36) NOT NULL COMMENT '队伍ID',
  season VARCHAR(20) NOT NULL COMMENT '赛季',
  matches_played INT DEFAULT 0 COMMENT '参赛场次',
  wins INT DEFAULT 0 COMMENT '胜场',
  draws INT DEFAULT 0 COMMENT '平局',
  losses INT DEFAULT 0 COMMENT '负场',
  goals INT DEFAULT 0 COMMENT '进球数',
  assists INT DEFAULT 0 COMMENT '助攻数',
  yellow_cards INT DEFAULT 0 COMMENT '黄牌数',
  red_cards INT DEFAULT 0 COMMENT '红牌数',
  mvp_count INT DEFAULT 0 COMMENT 'MVP次数',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_team_season (user_id, team_id, season),
  INDEX idx_team_season (team_id, season)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球员队内统计表';

-- ====================================
-- 14. 队伍统计表
-- ====================================
CREATE TABLE IF NOT EXISTS team_stats (
  id VARCHAR(36) PRIMARY KEY COMMENT '统计ID',
  team_id VARCHAR(36) UNIQUE NOT NULL COMMENT '队伍ID',
  season VARCHAR(20) NOT NULL COMMENT '赛季',
  matches_played INT DEFAULT 0 COMMENT '比赛场次',
  wins INT DEFAULT 0 COMMENT '胜场',
  draws INT DEFAULT 0 COMMENT '平局',
  losses INT DEFAULT 0 COMMENT '负场',
  goals_for INT DEFAULT 0 COMMENT '进球数',
  goals_against INT DEFAULT 0 COMMENT '失球数',
  goal_difference INT DEFAULT 0 COMMENT '净胜球',
  points INT DEFAULT 0 COMMENT '积分（胜3平1负0）',
  win_rate DECIMAL(5,2) DEFAULT 0 COMMENT '胜率',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  INDEX idx_season (season),
  INDEX idx_points (points),
  INDEX idx_goals (goals_for)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='队伍统计表';

-- ====================================
-- 15. 公告表
-- ====================================
CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(36) PRIMARY KEY COMMENT '公告ID',
  title VARCHAR(100) NOT NULL COMMENT '标题',
  content TEXT NOT NULL COMMENT '内容',
  type ENUM('announcement', 'match', 'team', 'system') DEFAULT 'announcement' COMMENT '类型',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '优先级',
  is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
  publisher_id VARCHAR(36) NOT NULL COMMENT '发布者ID',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  expires_at TIMESTAMP NULL COMMENT '过期时间',
  view_count INT DEFAULT 0 COMMENT '查看次数',
  FOREIGN KEY (publisher_id) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_published (published_at),
  INDEX idx_pinned (is_pinned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- ====================================
-- 完成
-- ====================================
