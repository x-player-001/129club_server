-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 106.53.217.216    Database: 129club
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icon` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('single_match','cumulative','streak') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'single_match',
  `condition` json DEFAULT NULL,
  `is_season_bound` tinyint(1) DEFAULT '0',
  `is_repeatable` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `code` (`code`) USING BTREE,
  KEY `idx_code` (`code`) USING BTREE,
  KEY `idx_is_active` (`is_active`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES ('1419c44b-ced4-4c8f-86e8-06ff3f3231c7','goal_machine','进球机器','Score 10 goals in the season','/static/images/goal-machine.png','cumulative','{\"field\": \"goals\", \"value\": 10, \"operator\": \">=\"}',1,0,5,1,'2025-10-20 22:16:50','2025-10-22 09:33:46'),('3dbd056d-3118-4710-80ca-47d708c69625','hat_trick','帽子戏法','Score 3 goals in a single match','/static/images/hat-trick.png','single_match','{\"field\": \"goals\", \"value\": 3, \"operator\": \">=\"}',1,1,1,1,'2025-10-20 22:16:50','2025-10-22 09:33:46'),('467aaca6-8016-4703-a1e1-4d2d05061994','perfect_attendance','全勤奖','100% attendance rate in the season','/static/images/perfect-attendence.png','cumulative','{\"field\": \"attendance\", \"value\": 100, \"operator\": \">=\"}',1,0,3,1,'2025-10-20 22:16:50','2025-10-22 09:33:46'),('48cb9e16-4137-4006-b774-a7829c79708b','winning_streak','连胜王','Win 3 matches in a row','/static/images/winning-streak.png','streak','{\"field\": \"consecutive_wins\", \"value\": 3, \"operator\": \">=\"}',1,1,6,1,'2025-10-20 22:16:50','2025-10-22 09:33:46'),('ab18c592-ef34-4dca-a577-75a08e59e4c4','assist_king','助攻王','Make 3 assists in a single match','/static/images/assist-king.png','single_match','{\"field\": \"assists\", \"value\": 3, \"operator\": \">=\"}',1,1,2,1,'2025-10-20 22:16:50','2025-10-22 09:33:46'),('b8e8584b-48fc-4e46-9429-775b5dcf3baa','mvp_collector','MVP收集者','Win MVP 5 times in the season','/static/images/mvp-collector.png','cumulative','{\"field\": \"mvp_count\", \"value\": 5, \"operator\": \">=\"}',1,0,4,1,'2025-10-20 22:16:50','2025-10-22 09:33:46');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `draft_picks`
--

DROP TABLE IF EXISTS `draft_picks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `draft_picks` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '选人记录ID',
  `reshuffle_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '重组ID',
  `round` int NOT NULL COMMENT '轮次',
  `pick_order` int NOT NULL COMMENT '选人顺序',
  `captain_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队长ID',
  `picked_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '被选中的用户ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `picked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '选择时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `captain_id` (`captain_id`) USING BTREE,
  KEY `picked_user_id` (`picked_user_id`) USING BTREE,
  KEY `team_id` (`team_id`) USING BTREE,
  KEY `idx_reshuffle` (`reshuffle_id`) USING BTREE,
  KEY `idx_round` (`round`) USING BTREE,
  CONSTRAINT `draft_picks_ibfk_1` FOREIGN KEY (`reshuffle_id`) REFERENCES `team_reshuffles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `draft_picks_ibfk_2` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `draft_picks_ibfk_3` FOREIGN KEY (`picked_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `draft_picks_ibfk_4` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='Draft选人记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `draft_picks`
--

LOCK TABLES `draft_picks` WRITE;
/*!40000 ALTER TABLE `draft_picks` DISABLE KEYS */;
/*!40000 ALTER TABLE `draft_picks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lineups`
--

DROP TABLE IF EXISTS `lineups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lineups` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '阵容ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `position` enum('GK','DF','MF','FW','SUB') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '场上位置',
  `jersey_number` int DEFAULT NULL COMMENT '球衣号码',
  `is_starter` tinyint(1) DEFAULT '1' COMMENT '是否首发',
  `set_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '设置者ID（队长）',
  `set_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '设置时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_match_team_user` (`match_id`,`team_id`,`user_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `set_by` (`set_by`) USING BTREE,
  KEY `idx_match` (`match_id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  CONSTRAINT `lineups_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lineups_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `lineups_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `lineups_ibfk_4` FOREIGN KEY (`set_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛阵容表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lineups`
--

LOCK TABLES `lineups` WRITE;
/*!40000 ALTER TABLE `lineups` DISABLE KEYS */;
/*!40000 ALTER TABLE `lineups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_events`
--

DROP TABLE IF EXISTS `match_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_events` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '事件ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `event_type` enum('goal','assist','save','yellow_card','red_card','substitution_in','substitution_out','referee') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '事件类型（新增save扑救、referee裁判）',
  `minute` int DEFAULT NULL COMMENT '发生时间（分钟）',
  `assist_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '助攻者ID（进球事件）',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '备注',
  `recorded_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '记录者ID',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  `quarter_number` tinyint DEFAULT NULL COMMENT '发生在第几节（1-4）',
  `event_subtype` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '事件子类型（如：far_shot远射, penalty点球）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `team_id` (`team_id`) USING BTREE,
  KEY `assist_user_id` (`assist_user_id`) USING BTREE,
  KEY `recorded_by` (`recorded_by`) USING BTREE,
  KEY `idx_match` (`match_id`) USING BTREE,
  KEY `idx_type` (`event_type`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  CONSTRAINT `match_events_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_4` FOREIGN KEY (`assist_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_5` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛事件表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_events`
--

LOCK TABLES `match_events` WRITE;
/*!40000 ALTER TABLE `match_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_participants`
--

DROP TABLE IF EXISTS `match_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_participants` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `match_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `is_present` tinyint(1) DEFAULT '1' COMMENT '是否到场',
  `arrival_time` timestamp NULL DEFAULT NULL COMMENT '到场时间',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_match_team_user` (`match_id`,`team_id`,`user_id`) USING BTREE,
  KEY `idx_match_id` (`match_id`) USING BTREE,
  KEY `team_id` (`team_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  CONSTRAINT `match_participants_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_participants_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_participants_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛到场人员表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_participants`
--

LOCK TABLES `match_participants` WRITE;
/*!40000 ALTER TABLE `match_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_quarters`
--

DROP TABLE IF EXISTS `match_quarters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_quarters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `match_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `quarter_number` tinyint NOT NULL COMMENT '节次编号 1-4',
  `team1_goals` int DEFAULT '0' COMMENT '队伍1进球数',
  `team2_goals` int DEFAULT '0' COMMENT '队伍2进球数',
  `team1_points` int DEFAULT '0' COMMENT '队伍1本节得分（1或2分）',
  `team2_points` int DEFAULT '0' COMMENT '队伍2本节得分（0、1或2分）',
  `duration_minutes` int DEFAULT '20' COMMENT '节次时长（分钟）',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '本节文字总结',
  `status` enum('in_progress','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'in_progress' COMMENT '节次状态：in_progress=进行中, completed=已完成',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_match_quarter` (`match_id`,`quarter_number`) USING BTREE,
  KEY `idx_match_id` (`match_id`) USING BTREE,
  CONSTRAINT `match_quarters_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛节次表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_quarters`
--

LOCK TABLES `match_quarters` WRITE;
/*!40000 ALTER TABLE `match_quarters` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_quarters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_results`
--

DROP TABLE IF EXISTS `match_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_results` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '结果ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team1_score` int NOT NULL DEFAULT '0' COMMENT '队伍1得分',
  `team2_score` int NOT NULL DEFAULT '0' COMMENT '队伍2得分',
  `winner_team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '获胜队伍ID',
  `penalty_shootout` tinyint(1) DEFAULT '0' COMMENT '鏄?惁杩涜?鐐圭悆澶ф垬(0=鍚? 1=鏄?',
  `team1_penalty_score` int unsigned DEFAULT NULL COMMENT '闃熶紞1鐐圭悆寰楀垎',
  `team2_penalty_score` int unsigned DEFAULT NULL COMMENT '闃熶紞2鐐圭悆寰楀垎',
  `penalty_winner_team_id` varchar(36) DEFAULT NULL COMMENT '鐐圭悆澶ф垬鑾疯儨闃熶紞ID',
  `mvp_user_ids` json DEFAULT NULL COMMENT 'MVP用户ID数组',
  `photos` json DEFAULT NULL COMMENT '比赛照片URL数组',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '比赛总结',
  `submitted_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '提交者ID',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `quarter_system` tinyint(1) DEFAULT '0' COMMENT '是否4节制',
  `team1_final_score` int DEFAULT NULL COMMENT '队伍1最终得分（4节制）',
  `team2_final_score` int DEFAULT NULL COMMENT '队伍2最终得分（4节制）',
  `team1_total_goals` int DEFAULT NULL COMMENT '队伍1总进球数',
  `team2_total_goals` int DEFAULT NULL COMMENT '队伍2总进球数',
  `raw_report` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '原始简报文本',
  `parsed_by_ai` tinyint(1) DEFAULT '0' COMMENT '是否由AI解析导入',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `match_id` (`match_id`) USING BTREE,
  KEY `winner_team_id` (`winner_team_id`) USING BTREE,
  KEY `submitted_by` (`submitted_by`) USING BTREE,
  KEY `fk_penalty_winner_team` (`penalty_winner_team_id`),
  CONSTRAINT `fk_penalty_winner_team` FOREIGN KEY (`penalty_winner_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `match_results_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_results_ibfk_2` FOREIGN KEY (`winner_team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_results_ibfk_4` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛结果表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_results`
--

LOCK TABLES `match_results` WRITE;
/*!40000 ALTER TABLE `match_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛标题',
  `team1_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍1 ID',
  `team2_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍2 ID',
  `match_date` timestamp NOT NULL COMMENT '比赛时间',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '比赛地点',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '比赛说明',
  `status` enum('upcoming','registration','lineup_set','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'upcoming' COMMENT '比赛状态',
  `registration_deadline` timestamp NULL DEFAULT NULL COMMENT '报名截止时间',
  `max_players_per_team` int DEFAULT '11' COMMENT '每队最多报名人数',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '创建者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `quarter_system` tinyint(1) DEFAULT '0' COMMENT '是否使用4节制（true=4节制，false=传统全场制）',
  `final_team1_score` int DEFAULT '0' COMMENT '队伍1最终得分（4节制累计分数）',
  `final_team2_score` int DEFAULT '0' COMMENT '队伍2最终得分（4节制累计分数）',
  `season_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '所属赛季ID',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `created_by` (`created_by`) USING BTREE,
  KEY `idx_match_date` (`match_date`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_team1` (`team1_id`) USING BTREE,
  KEY `idx_team2` (`team2_id`) USING BTREE,
  KEY `idx_season_id` (`season_id`) USING BTREE,
  CONSTRAINT `fk_matches_season` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '公告ID',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '内容',
  `type` enum('announcement','match','team','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'announcement' COMMENT '类型',
  `priority` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'medium' COMMENT '优先级',
  `is_pinned` tinyint(1) DEFAULT '0' COMMENT '是否置顶',
  `publisher_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '发布者ID',
  `published_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT '过期时间',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `publisher_id` (`publisher_id`) USING BTREE,
  KEY `idx_type` (`type`) USING BTREE,
  KEY `idx_published` (`published_at`) USING BTREE,
  KEY `idx_pinned` (`is_pinned`) USING BTREE,
  CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`publisher_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES ('2c3aca39-a7ba-4e5e-9554-3485fbd9ba70','Welcome','First announcement','announcement','high',1,'4b715272-e350-47bf-b436-b0fe8ecfb386','2025-10-16 08:15:17',NULL,1);
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('achievement','match','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `is_shown` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_read` (`user_id`,`is_read`) USING BTREE,
  KEY `idx_user_shown` (`user_id`,`is_shown`) USING BTREE,
  KEY `idx_created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `resource` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '资源名称',
  `action` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作类型 create/read/update/delete',
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',
  `granted_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '授权人ID',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  KEY `idx_resource` (`resource`) USING BTREE,
  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('140db0c6-c208-11f0-b163-525400735d47','user-test-01','match','create','2025-11-15 09:47:20',NULL),('140db449-c208-11f0-b163-525400735d47','user-test-02','match','create','2025-11-15 09:47:20',NULL),('140db5ba-c208-11f0-b163-525400735d47','user-test-03','match','create','2025-11-15 09:47:20',NULL),('140db713-c208-11f0-b163-525400735d47','user-test-04','match','create','2025-11-15 09:47:20',NULL),('140db7ff-c208-11f0-b163-525400735d47','user-test-05','match','create','2025-11-15 09:47:20',NULL),('140db8d8-c208-11f0-b163-525400735d47','user-test-06','match','create','2025-11-15 09:47:20',NULL),('140db991-c208-11f0-b163-525400735d47','user-test-07','match','create','2025-11-15 09:47:20',NULL),('140dba7a-c208-11f0-b163-525400735d47','user-test-08','match','create','2025-11-15 09:47:20',NULL),('140dbb54-c208-11f0-b163-525400735d47','user-test-09','match','create','2025-11-15 09:47:20',NULL),('140dbc1e-c208-11f0-b163-525400735d47','user-test-10','match','create','2025-11-15 09:47:20',NULL),('140dbce9-c208-11f0-b163-525400735d47','user-test-11','match','create','2025-11-15 09:47:20',NULL),('140dbd9c-c208-11f0-b163-525400735d47','user-test-12','match','create','2025-11-15 09:47:20',NULL),('14125655-c208-11f0-b163-525400735d47','user-test-01','team','view','2025-11-15 09:47:20',NULL),('141259d2-c208-11f0-b163-525400735d47','user-test-02','team','view','2025-11-15 09:47:20',NULL),('14125a8f-c208-11f0-b163-525400735d47','user-test-03','team','view','2025-11-15 09:47:20',NULL),('14125b5b-c208-11f0-b163-525400735d47','user-test-04','team','view','2025-11-15 09:47:20',NULL),('14125bf3-c208-11f0-b163-525400735d47','user-test-05','team','view','2025-11-15 09:47:20',NULL),('14125c7e-c208-11f0-b163-525400735d47','user-test-06','team','view','2025-11-15 09:47:20',NULL),('14125d0f-c208-11f0-b163-525400735d47','user-test-07','team','view','2025-11-15 09:47:20',NULL),('14125d9d-c208-11f0-b163-525400735d47','user-test-08','team','view','2025-11-15 09:47:20',NULL),('14125e23-c208-11f0-b163-525400735d47','user-test-09','team','view','2025-11-15 09:47:20',NULL),('14125eac-c208-11f0-b163-525400735d47','user-test-10','team','view','2025-11-15 09:47:20',NULL),('14125f34-c208-11f0-b163-525400735d47','user-test-11','team','view','2025-11-15 09:47:20',NULL),('14125fc2-c208-11f0-b163-525400735d47','user-test-12','team','view','2025-11-15 09:47:20',NULL);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_stats`
--

DROP TABLE IF EXISTS `player_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_stats` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '统计ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `matches_played` int DEFAULT '0' COMMENT '参赛场次',
  `wins` int DEFAULT '0' COMMENT '胜场',
  `draws` int DEFAULT '0' COMMENT '平局',
  `losses` int DEFAULT '0' COMMENT '负场',
  `goals` int DEFAULT '0' COMMENT '进球数',
  `assists` int DEFAULT '0' COMMENT '助攻数',
  `yellow_cards` int DEFAULT '0' COMMENT '黄牌数',
  `red_cards` int DEFAULT '0' COMMENT '红牌数',
  `mvp_count` int DEFAULT '0' COMMENT 'MVP次数',
  `attendance_rate` decimal(5,2) DEFAULT '0.00' COMMENT '出勤率',
  `win_rate` decimal(5,2) DEFAULT '0.00' COMMENT '胜率',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `user_id` (`user_id`) USING BTREE,
  KEY `idx_goals` (`goals`) USING BTREE,
  KEY `idx_assists` (`assists`) USING BTREE,
  KEY `idx_mvp` (`mvp_count`) USING BTREE,
  CONSTRAINT `player_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='球员总体统计表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_stats`
--

LOCK TABLES `player_stats` WRITE;
/*!40000 ALTER TABLE `player_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_team_stats`
--

DROP TABLE IF EXISTS `player_team_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_team_stats` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '统计ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季',
  `matches_played` int DEFAULT '0' COMMENT '参赛场次',
  `wins` int DEFAULT '0' COMMENT '胜场',
  `draws` int DEFAULT '0' COMMENT '平局',
  `losses` int DEFAULT '0' COMMENT '负场',
  `goals` int DEFAULT '0' COMMENT '进球数',
  `assists` int DEFAULT '0' COMMENT '助攻数',
  `yellow_cards` int DEFAULT '0' COMMENT '黄牌数',
  `red_cards` int DEFAULT '0' COMMENT '红牌数',
  `mvp_count` int DEFAULT '0' COMMENT 'MVP次数',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_team_season` (`user_id`,`team_id`,`season`) USING BTREE,
  KEY `idx_team_season` (`team_id`,`season`) USING BTREE,
  CONSTRAINT `player_team_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `player_team_stats_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='球员队内统计表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_team_stats`
--

LOCK TABLES `player_team_stats` WRITE;
/*!40000 ALTER TABLE `player_team_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_team_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '位置ID',
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '位置编码',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '位置名称(中文)',
  `name_en` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '位置名称(英文)',
  `category` enum('GK','DF','MF','FW') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '位置大类',
  `sort_order` int DEFAULT '0' COMMENT '排序顺序',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '位置描述',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `code` (`code`) USING BTREE,
  KEY `idx_code` (`code`) USING BTREE,
  KEY `idx_category` (`category`) USING BTREE,
  KEY `idx_is_active` (`is_active`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='位置字典表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,'GK','守门员','Goalkeeper','GK',1,1,'守门员'),(2,'CB','中后卫','Center Back','DF',10,1,'中路防守核心'),(3,'LCB','左中卫','Left Center Back','DF',11,0,'左侧中后卫'),(4,'RCB','右中卫','Right Center Back','DF',12,0,'右侧中后卫'),(5,'LB','左后卫','Left Back','DF',13,1,'左路防守'),(6,'RB','右后卫','Right Back','DF',14,1,'右路防守'),(7,'LWB','左边后卫','Left Wing Back','DF',15,0,'左路攻守兼备'),(8,'RWB','右边后卫','Right Wing Back','DF',16,0,'右路攻守兼备'),(9,'SW','清道夫','Sweeper','DF',17,0,'拖后中卫'),(10,'CDM','后腰','Defensive Midfielder','MF',20,1,'防守型中场'),(11,'CM','中前卫','Central Midfielder','MF',21,0,'中路组织'),(12,'CAM','前腰','Attacking Midfielder','MF',22,1,'进攻型中场'),(13,'LM','左前卫','Left Midfielder','MF',23,0,'左路中场'),(14,'RM','右前卫','Right Midfielder','MF',24,0,'右路中场'),(15,'LW','左边锋','Left Winger','FW',25,1,'左路进攻'),(16,'RW','右边锋','Right Winger','FW',26,1,'右路进攻'),(17,'CF','中锋','Center Forward','FW',30,1,'中路进攻核心'),(18,'ST','前锋','Striker','FW',31,0,'射手'),(19,'LF','左前锋','Left Forward','FW',32,0,'左路前锋'),(20,'RF','右前锋','Right Forward','FW',33,0,'右路前锋'),(21,'SS','影锋','Second Striker','FW',34,0,'前场自由人');
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '报名ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID（报名时所属队伍）',
  `status` enum('registered','confirmed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'registered' COMMENT '报名状态',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_match_user` (`match_id`,`user_id`) USING BTREE,
  KEY `idx_match` (`match_id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='比赛报名表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季名称，如2025-S1',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '赛季标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '赛季说明',
  `start_date` datetime DEFAULT NULL COMMENT '赛季开始日期',
  `end_date` datetime DEFAULT NULL COMMENT '赛季结束日期',
  `max_matches` int DEFAULT '10' COMMENT '赛季最大比赛场数',
  `status` enum('upcoming','active','completed','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'upcoming' COMMENT '赛季状态',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '创建者ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_name` (`name`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_start_date` (`start_date`) USING BTREE,
  KEY `idx_created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='赛季表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
INSERT INTO `seasons` VALUES ('ed6cba6b-5e8e-4985-a674-e2d8701a1171','第一届两江超级联赛','两江超级联赛','第一届','2025-10-20 08:00:00',NULL,10,'active','5bc76f4f-a2a3-450a-9bee-6d0af2e9333e','2025-10-20 10:33:10',NULL);
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '关系ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `role` enum('captain','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'member' COMMENT '队内角色',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否在队',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_team` (`team_id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  KEY `idx_active` (`is_active`) USING BTREE,
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='队伍成员关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES ('46ad84bf-c394-11f0-b163-525400735d47','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','277dc273-6b68-4d68-8414-3f2672278a6e','2025-11-17 09:03:25','member',1),('536f9ccf-c394-11f0-b163-525400735d47','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','407b88e4-d9cf-4c78-bff5-85e4fa868eca','2025-11-17 09:03:47','captain',1),('586d6dca-c394-11f0-b163-525400735d47','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:03:55','member',1),('5c10a394-c394-11f0-b163-525400735d47','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','9bb0beb2-1810-466e-9e60-713a82f2c6df','2025-11-17 09:04:01','member',1);
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_reshuffles`
--

DROP TABLE IF EXISTS `team_reshuffles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_reshuffles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '重组ID',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季',
  `initiator_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '发起人ID',
  `captain1_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队长1 ID',
  `captain2_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队长2 ID',
  `team1_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队伍1 ID',
  `team2_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队伍2 ID',
  `status` enum('draft_in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'draft_in_progress' COMMENT '状态',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `initiator_id` (`initiator_id`) USING BTREE,
  KEY `captain1_id` (`captain1_id`) USING BTREE,
  KEY `captain2_id` (`captain2_id`) USING BTREE,
  KEY `team1_id` (`team1_id`) USING BTREE,
  KEY `team2_id` (`team2_id`) USING BTREE,
  KEY `idx_season` (`season`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  CONSTRAINT `team_reshuffles_ibfk_1` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_2` FOREIGN KEY (`captain1_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_3` FOREIGN KEY (`captain2_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_4` FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_5` FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='队伍重组记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_reshuffles`
--

LOCK TABLES `team_reshuffles` WRITE;
/*!40000 ALTER TABLE `team_reshuffles` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_reshuffles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_stats`
--

DROP TABLE IF EXISTS `team_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_stats` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '统计ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季',
  `matches_played` int DEFAULT '0' COMMENT '比赛场次',
  `wins` int DEFAULT '0' COMMENT '胜场',
  `draws` int DEFAULT '0' COMMENT '平局',
  `losses` int DEFAULT '0' COMMENT '负场',
  `goals_for` int DEFAULT '0' COMMENT '进球数',
  `goals_against` int DEFAULT '0' COMMENT '失球数',
  `goal_difference` int DEFAULT '0' COMMENT '净胜球',
  `points` int DEFAULT '0' COMMENT '积分（胜3平1负0）',
  `win_rate` decimal(5,2) DEFAULT '0.00' COMMENT '胜率',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `team_id` (`team_id`) USING BTREE,
  KEY `idx_season` (`season`) USING BTREE,
  KEY `idx_points` (`points`) USING BTREE,
  KEY `idx_goals` (`goals_for`) USING BTREE,
  CONSTRAINT `team_stats_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='队伍统计表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_stats`
--

LOCK TABLES `team_stats` WRITE;
/*!40000 ALTER TABLE `team_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队名',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队徽URL',
  `captain_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队长ID',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '队伍主色调',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季/期数 如2025-S1',
  `status` enum('active','disbanded','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'active' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `disbanded_at` timestamp NULL DEFAULT NULL COMMENT '解散时间',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '创建者ID',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_season` (`season`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_captain` (`captain_id`) USING BTREE,
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='队伍表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES ('281a79c2-e10a-4bfa-8dc8-def0b7b7580a','长江黄河','/images/cjhh.png','user-test-01','#934bb0','第一届两江超级联赛','active','2025-10-22 01:12:04',NULL,'eb08d787-f522-44a0-a4db-d7f867fab92f'),('b6ab3e9b-7bd7-468f-ae54-51c7675831e3','嘉陵摩托','/images/jlmt.png','407b88e4-d9cf-4c78-bff5-85e4fa868eca','#c10e15','第一届两江超级联赛','active','2025-10-22 01:12:04',NULL,'eb08d787-f522-44a0-a4db-d7f867fab92f');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `achievement_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `season_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unlocked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unlock_count` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `unique_user_achievement_season` (`user_id`,`achievement_id`,`season_id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_achievement_id` (`achievement_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_visit_logs`
--

DROP TABLE IF EXISTS `user_visit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_visit_logs` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '日志ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `visit_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  `visit_date` date NOT NULL COMMENT '访问日期（便于统计）',
  `platform` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '平台（iOS/Android/devtools）',
  `app_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '小程序版本号',
  `scene` int DEFAULT NULL COMMENT '场景值（从哪里进入小程序）',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'IP地址',
  `device_model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '设备型号',
  `system_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '操作系统版本',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_visit_date` (`visit_date`),
  KEY `idx_visit_time` (`visit_time`),
  CONSTRAINT `fk_visit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户访问日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_visit_logs`
--

LOCK TABLES `user_visit_logs` WRITE;
/*!40000 ALTER TABLE `user_visit_logs` DISABLE KEYS */;
INSERT INTO `user_visit_logs` VALUES ('01e68435-ba2e-4960-b83b-ef03e956a0a1','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:24:28','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:24:28'),('0221ed4b-eeb5-4332-96ad-2f6efbf44d8e','370f143c-17fe-4df4-b2d6-f75ed4a97a99','2025-11-17 12:11:10','2025-11-17','android','8.0.54',1048,'::ffff:127.0.0.1','2308CPXD0C','Android 15','2025-11-17 12:11:10'),('029cad47-6321-4234-ab3c-a62b2913a9e3','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:27:40','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:27:40'),('04f3a945-2d69-4d02-b344-bdd7b5b48c05','71d7ab1d-1674-4f0f-8a81-d0348f45ed83','2025-11-17 12:24:04','2025-11-17','ohos','8.0.12',1048,'::ffff:127.0.0.1','ADY-AL10','OpenHarmonyOS 6.0.0','2025-11-17 12:24:04'),('05d64bab-c283-4486-b135-ab0dcceb469a','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:20:16','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:20:16'),('0856fdd1-3787-4830-8f7c-33d1f03bf4e7','37a97715-d228-479b-a032-e04e24b43ae7','2025-11-17 12:55:10','2025-11-17','android','8.0.58',1089,'::ffff:127.0.0.1','TDT-MA01','Android 10','2025-11-17 12:55:10'),('0db2b441-0ddb-4d98-875f-82ce29346e6b','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:10:44','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:10:44'),('10bf062e-402d-4a29-b2c0-a988770af272','9bb0beb2-1810-466e-9e60-713a82f2c6df','2025-11-17 10:13:20','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','ELS-AN00','Android 12','2025-11-17 10:13:20'),('110d5042-e227-44b6-9f7b-9d37ecd10d1b','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:04:37','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:04:37'),('116f0c76-b4da-4b1d-ab9c-3c01d26a6a48','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:52:17','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:52:17'),('14c0b3fd-ed11-4f04-811f-c05c5d8c88d2','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:39:44','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:39:44'),('14f415fc-f1fe-465c-94bb-c4db2298f366','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:22:51','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:22:51'),('19af8dc7-7d69-4078-97f2-cec383b07d25','407b88e4-d9cf-4c78-bff5-85e4fa868eca','2025-11-17 12:43:45','2025-11-17','android','8.0.64',1089,'::ffff:127.0.0.1','PLR-AL50','Android 12','2025-11-17 12:43:45'),('19fb8e74-ad33-4b41-8a87-fd1011c77601','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:04:54','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:04:54'),('1b66c251-2f47-4307-acea-bd206246f66c','7dda9b5f-62ca-4e98-a44d-943cb982c684','2025-11-17 12:41:13','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','PKB110','Android 16','2025-11-17 12:41:13'),('1bbb97c9-bf4a-49c9-8450-472600a43126','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:23:18','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:23:18'),('1ff4b8e9-7f91-427a-b982-0dc87b4603c2','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:37:20','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:37:20'),('245c6e31-af73-4aa8-a5bb-b88fb851010e','1ab26cea-e054-4500-a4a9-14b9b82239ad','2025-11-17 12:21:51','2025-11-17','ios','8.0.65',1048,'::ffff:127.0.0.1','iPhone XR<iPhone11,8>','iOS 18.6.2','2025-11-17 12:21:51'),('26840e1f-800f-4be9-821e-bf3536e5c6f8','7ac814ea-1d64-4878-a68e-cbba2cf028e8','2025-11-17 12:02:21','2025-11-17','ios','8.0.65',1048,'::ffff:127.0.0.1','iPhone 13 Pro Max<iPhone14,3>','iOS 17.5.1','2025-11-17 12:02:21'),('2941ebfe-e941-443a-aa8b-d65ce51ab3ba','41097aab-54bd-4800-84cf-f79e8f7d3d2b','2025-11-17 12:17:18','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','ANN-AN00','Android 15','2025-11-17 12:17:18'),('2a06aebf-3263-48d0-8e4d-68fade338f05','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:28:12','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:28:12'),('2ce0e43d-b652-4ed4-8852-d3d85b182b51','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 10:57:37','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 10:57:37'),('3799aec8-e5e9-4a2a-9484-92d921e54226','37a97715-d228-479b-a032-e04e24b43ae7','2025-11-17 12:31:39','2025-11-17','android','8.0.58',1048,'::ffff:127.0.0.1','TDT-MA01','Android 10','2025-11-17 12:31:39'),('3e57c647-9752-44b1-9670-e65f8d0b0004','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:40:57','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:40:57'),('4253e3bd-3c58-4ff2-b069-62774dd1e658','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:18:36','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:18:36'),('4bbc3329-efae-4a06-bf5b-ade2e3342407','407b88e4-d9cf-4c78-bff5-85e4fa868eca','2025-11-17 11:58:21','2025-11-17','android','8.0.64',1048,'::ffff:127.0.0.1','PLR-AL50','Android 12','2025-11-17 11:58:21'),('4c4d9599-f41d-4919-8e32-b7e97da3d569','37a97715-d228-479b-a032-e04e24b43ae7','2025-11-17 12:26:11','2025-11-17','android','8.0.58',1048,'::ffff:127.0.0.1','TDT-MA01','Android 10','2025-11-17 12:26:11'),('4cdcd2dc-de40-4305-a611-5b764f10c946','7dda9b5f-62ca-4e98-a44d-943cb982c684','2025-11-17 12:03:21','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','PKB110','Android 16','2025-11-17 12:03:21'),('4dfa4275-e1ab-485d-8de5-df6081f5ab23','09f94250-a533-490b-bea7-295e2b128737','2025-11-17 12:01:22','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','ABR-AL80','Android 12','2025-11-17 12:01:22'),('52030871-f176-4ccb-b09c-c3cd65ff5f92','d79a0e39-d5cc-41a0-afac-ae59da779797','2025-11-17 11:58:49','2025-11-17','android','8.0.64',1048,'::ffff:127.0.0.1','PKG110','Android 15','2025-11-17 11:58:49'),('5386eea2-39d5-4229-881d-15df4575778b','26c50a79-562c-4ca6-b156-45023eee3c94','2025-11-17 12:31:25','2025-11-17','ios','8.0.65',1001,'::ffff:127.0.0.1','iPhone X (GSM+CDMA)<iPhone10,3>','iOS 14.8.1','2025-11-17 12:31:25'),('54ce6fa2-53f7-4cd3-8a71-a39444d3fb1a','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:31:29','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:31:29'),('55ff2fac-e707-4896-8dcf-f68c3c2cd156','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:04:04','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:04:04'),('5a2200b1-8106-423c-a65e-2f1e9fb55e6e','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:16:22','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:16:22'),('5b59bae7-86a0-4dd4-8da0-5d197a4fc13b','407b88e4-d9cf-4c78-bff5-85e4fa868eca','2025-11-17 10:25:01','2025-11-17','android','8.0.64',1089,'::ffff:127.0.0.1','PLR-AL50','Android 12','2025-11-17 10:25:01'),('5bb22eb9-029f-4f69-ac47-8f7ba2863e8b','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 07:52:56','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 07:52:56'),('5ec69d62-c8ad-4cb1-a195-c8a59bb47a79','e18ad310-339b-48b4-8745-58630b87ba3d','2025-11-17 13:03:06','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','LIO-AN00m','Android 12','2025-11-17 13:03:06'),('5ed036a0-3262-45b9-9a4a-e56b5fed6a28','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:07:02','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:07:02'),('5f38f4b0-b1f6-4fd2-8df6-6f9c78fb2619','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:29:15','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:29:15'),('6df02341-758e-48fd-a184-771f41e84753','407b88e4-d9cf-4c78-bff5-85e4fa868eca','2025-11-17 10:32:00','2025-11-17','android','8.0.64',1089,'::ffff:127.0.0.1','PLR-AL50','Android 12','2025-11-17 10:32:00'),('76a06094-b707-4e8e-aba7-8dac244ebee1','9c0ccbee-c7a4-4da5-9147-7e117f9eb16a','2025-11-17 12:11:17','2025-11-17','ios','8.0.54',1048,'::ffff:127.0.0.1','iPhone 15 pro max<iPhone16,2>','iOS 18.6.2','2025-11-17 12:11:17'),('77627015-dd54-42b2-853c-c55ad502c01d','f6f0089f-906c-440f-ac5c-68b479e13133','2025-11-17 12:27:03','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','PKB110','Android 15','2025-11-17 12:27:03'),('78a3da68-cd70-4f09-9b37-5f17aa9867d8','26c50a79-562c-4ca6-b156-45023eee3c94','2025-11-17 12:09:47','2025-11-17','ios','8.0.65',1048,'::ffff:127.0.0.1','iPhone X (GSM+CDMA)<iPhone10,3>','iOS 14.8.1','2025-11-17 12:09:47'),('78b6333b-d0e0-4647-81fa-a55835ae0843','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:24:23','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:24:23'),('7c9809dd-d053-4f43-8b87-e01485cf92a9','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:49:34','2025-11-17','android','8.0.65',1047,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:49:34'),('7eed79df-4abf-46db-8d78-df55f1684996','84e2f056-3854-41e6-9941-25f9a428fcda','2025-11-17 12:15:27','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','24069RA21C','Android 14','2025-11-17 12:15:27'),('8336d28e-8f15-4713-984a-d5a84590de0e','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:46:15','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:46:15'),('89d35045-3a4c-4efd-ab26-0ee87ab51d51','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:12:32','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:12:32'),('8e230c4d-d7dd-4ef5-ae58-ca5b455e54d0','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:23:25','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:23:25'),('8f879df9-5d31-46e3-9c4c-ce2aa301a814','09f94250-a533-490b-bea7-295e2b128737','2025-11-17 12:14:37','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','ABR-AL80','Android 12','2025-11-17 12:14:37'),('92d1b557-f4c7-456e-ab69-b83ebf190f24','7fbeef0d-dd93-457b-a259-16e869430e28','2025-11-17 10:17:07','2025-11-17','ios','8.0.65',1048,'::ffff:127.0.0.1','iPhone 16 Pro Max<iPhone17,2>','iOS 18.0','2025-11-17 10:17:07'),('96263314-687a-4d8c-9046-5baf7f2051de','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:11:52','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:11:52'),('973da1c6-555b-401c-96f9-db60713e88cf','d00e587b-de8f-44d5-b716-9d7860266be6','2025-11-17 12:35:56','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','BRA-AL00','Android 12','2025-11-17 12:35:56'),('97df4464-fbbe-4e55-9e2e-84430e81ab99','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:34:32','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:34:32'),('9d568095-d85c-42b3-b381-a01320c98d3b','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:39:39','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:39:39'),('9d73f0ec-8eff-463d-8ff7-052291862a23','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:16:10','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:16:10'),('9ef2b7dd-6d71-4f8e-8163-d2bfe028dcdf','41097aab-54bd-4800-84cf-f79e8f7d3d2b','2025-11-17 12:02:19','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','ANN-AN00','Android 15','2025-11-17 12:02:19'),('a70f76e0-729e-4ebe-a1ff-1c741c9b29f1','277dc273-6b68-4d68-8414-3f2672278a6e','2025-11-17 08:24:39','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','ALN-AL80','Android 12','2025-11-17 08:24:39'),('a9b8443f-8e5a-4554-afab-3ce0f931c17e','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:10:47','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:10:47'),('a9faa273-aad7-467b-9bbd-b80c54d87833','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:59:37','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:59:37'),('ac8661a6-a729-49bf-a0a4-4f3cdb75b64b','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:04:07','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:04:07'),('b9660ca0-c0de-44d2-b230-f87712986323','84e2f056-3854-41e6-9941-25f9a428fcda','2025-11-17 12:08:58','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','24069RA21C','Android 14','2025-11-17 12:08:58'),('bacdd818-8a27-4a7a-bb6c-c5162742801c','9bb0beb2-1810-466e-9e60-713a82f2c6df','2025-11-17 10:32:26','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','ELS-AN00','Android 12','2025-11-17 10:32:26'),('bbeaaef4-fbd0-4e84-95fe-3e5572d99c1b','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:54:52','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:54:52'),('c66d313c-fbc3-4347-97e3-21b266bac8e6','370f143c-17fe-4df4-b2d6-f75ed4a97a99','2025-11-17 12:46:58','2025-11-17','android','8.0.54',1048,'::ffff:127.0.0.1','2308CPXD0C','Android 15','2025-11-17 12:46:58'),('c9a5f804-11ad-4981-a84e-75468f07b095','370f143c-17fe-4df4-b2d6-f75ed4a97a99','2025-11-17 12:23:19','2025-11-17','android','8.0.54',1048,'::ffff:127.0.0.1','2308CPXD0C','Android 15','2025-11-17 12:23:19'),('cdd78e65-fc8f-4be9-b8e3-6848af9c9023','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:18:31','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:18:31'),('cf11a830-19fb-40bd-be65-1defb5bd8d1f','407b88e4-d9cf-4c78-bff5-85e4fa868eca','2025-11-17 08:56:31','2025-11-17','android','8.0.64',1089,'::ffff:127.0.0.1','PLR-AL50','Android 12','2025-11-17 08:56:31'),('cf562555-f1bf-4d22-ba7e-e57037249286','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:54:03','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:54:03'),('d08e0f15-16dc-4b0e-9fa0-e42db43f6a49','f6f0089f-906c-440f-ac5c-68b479e13133','2025-11-17 12:18:32','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','PKB110','Android 15','2025-11-17 12:18:32'),('d17dad68-dd36-40f3-840c-9c1a617936cd','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 11:49:39','2025-11-17','android','8.0.65',1047,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 11:49:39'),('d5a9c880-5379-47f7-86b3-75f667d55917','e18ad310-339b-48b4-8745-58630b87ba3d','2025-11-17 12:08:28','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','LIO-AN00m','Android 12','2025-11-17 12:08:28'),('d643d59e-9cc2-4eb5-bfb6-2c5ea796d0ed','84e2f056-3854-41e6-9941-25f9a428fcda','2025-11-17 12:21:17','2025-11-17','android','8.0.65',1048,'::ffff:127.0.0.1','24069RA21C','Android 14','2025-11-17 12:21:17'),('d9a0a977-ae82-4223-a02f-dcb14d9679e0','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:14:40','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:14:40'),('db4b3e6b-0955-4ef1-98df-c90900eabd5d','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:01:22','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:01:22'),('db8cec94-2f18-4286-b0fe-1ee823858fa5','7fbeef0d-dd93-457b-a259-16e869430e28','2025-11-17 11:59:58','2025-11-17','ios','8.0.65',1048,'::ffff:127.0.0.1','iPhone 16 Pro Max<iPhone17,2>','iOS 18.0','2025-11-17 11:59:58'),('dc87acd2-f865-44ca-952b-29a97bc9597d','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:00:25','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:00:25'),('df89455f-3c2e-44ef-90dc-dcea8b70a1a3','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 08:29:56','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 08:29:56'),('eab2b23d-378b-45f1-9b8e-0e63499bdf5c','6a1ea615-5f87-4e6a-bc3a-214ee9a48646','2025-11-17 12:34:00','2025-11-17','ios','8.0.65',1048,'::ffff:127.0.0.1','iPhone 13 Pro Max<iPhone14,3>','iOS 18.6.2','2025-11-17 12:34:00'),('eccb31cd-9f0a-40b8-9b46-594c4bb1b2ed','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 09:48:10','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 09:48:10'),('eccb89f6-4ac6-44e4-9518-04143b7bf741','21a35430-9b03-4adf-9ac1-be66f1aad476','2025-11-17 12:14:52','2025-11-17','ohos','8.0.12',1048,'::ffff:127.0.0.1','LMR-AL00','OpenHarmonyOS 6.0.0','2025-11-17 12:14:52'),('f3802e7d-bb1d-4666-9b26-7335fc666304','277dc273-6b68-4d68-8414-3f2672278a6e','2025-11-17 12:01:40','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','ALN-AL80','Android 12','2025-11-17 12:01:40'),('f53fc363-5e0b-4ec6-8bed-c948bb3bb43d','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 06:20:14','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 06:20:14'),('f7e58466-f2b9-47a4-86d5-e345b0b60d48','21a35430-9b03-4adf-9ac1-be66f1aad476','2025-11-17 12:32:51','2025-11-17','ohos','8.0.12',1048,'::ffff:127.0.0.1','LMR-AL00','OpenHarmonyOS 6.0.0','2025-11-17 12:32:51'),('f9b41325-d777-455f-9b1d-4dc460fcce06','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 07:38:33','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 07:38:33'),('ff60a3e9-b200-4ce2-811b-1d9512fe0fcc','942b0614-06e4-4e35-acd8-52f806a9a5c7','2025-11-17 12:43:14','2025-11-17','android','8.0.65',1089,'::ffff:127.0.0.1','HBN-AL00','Android 12','2025-11-17 12:43:14');
/*!40000 ALTER TABLE `user_visit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID (UUID)',
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '微信openid',
  `unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '昵称',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '真实姓名',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '手机号',
  `jersey_number` int DEFAULT NULL COMMENT '球衣号码',
  `position` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '场上位置编码JSON数组 (支持多选, 如 ["CAM","LW","ST"])',
  `left_foot_skill` tinyint unsigned DEFAULT '0' COMMENT '左脚擅长程度(0-5)',
  `right_foot_skill` tinyint unsigned DEFAULT '0' COMMENT '右脚擅长程度(0-5)',
  `role` enum('super_admin','captain','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'member' COMMENT '角色',
  `status` enum('active','inactive','leave') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'active' COMMENT '状态',
  `current_team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '当前队伍ID',
  `join_date` date DEFAULT NULL COMMENT '加入日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `member_type` enum('regular','temporary') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'temporary' COMMENT '队员类型（regular=正式队员, temporary=临时队员）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `openid` (`openid`) USING BTREE,
  KEY `idx_openid` (`openid`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_team` (`current_team_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('09f94250-a533-490b-bea7-295e2b128737','okxVv12GLttCziYW64VWNxx7kmMQ',NULL,'铜元局皮尔洛','王清亮','https://api.129club.cloud/user_avatars/2025/11/1763380888326_lkx3xq.jpg',NULL,22,'[\"RB\",\"RW\"]',0,5,'member','active',NULL,NULL,'2025-11-17 11:59:39','2025-11-17 12:01:30','temporary'),('108f7973-6baa-47ae-8138-139723ad1eb5','okxVv1z_p7z0RouQkkDiwJ2sVAb0',NULL,'laughing鑫','王鑫','https://api.129club.cloud/user_avatars/2025/11/1763380950540_4aowxj.jpeg',NULL,31,'[\"RB\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:01:12','2025-11-17 12:02:31','temporary'),('1ab26cea-e054-4500-a4a9-14b9b82239ad','okxVv1z2hxL4ZmKQ_rsAySMWvw1s',NULL,'小房','房光宇','https://api.129club.cloud/user_avatars/2025/11/1763382152076_ya2jmk.jpg',NULL,88,'[\"CF\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:20:26','2025-11-17 12:22:37','temporary'),('21a35430-9b03-4adf-9ac1-be66f1aad476','okxVv1z7J0w0hiGNJe2NlA2F-X4U',NULL,'施毅','施毅','https://api.129club.cloud/user_avatars/2025/11/1763382869997_cdjyzb.jpeg',NULL,45,'[\"CAM\",\"CDM\"]',2,5,'member','active',NULL,NULL,'2025-11-17 12:07:10','2025-11-17 12:34:32','temporary'),('26c50a79-562c-4ca6-b156-45023eee3c94','okxVv1x_LZZUKt_YZEWt8sbtbI5M',NULL,'屠夫','郑彤','https://api.129club.cloud/user_avatars/2025/11/1763381504218_cl76db.jpg',NULL,13,'[\"CDM\",\"RB\",\"LB\",\"LW\",\"RW\"]',1,1,'member','active',NULL,NULL,'2025-11-17 12:06:18','2025-11-17 12:11:47','temporary'),('277dc273-6b68-4d68-8414-3f2672278a6e','okxVv1_b9ryl3s-7D_aV_KOTjizU',NULL,'公园-加图索','李洪胜','https://api.129club.cloud/user_avatars/2025/11/1763367366796_resd12.jpeg',NULL,8,'[\"CDM\",\"CF\",\"CB\"]',1,1,'member','active','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','2025-11-17','2025-11-17 08:15:25','2025-11-17 09:03:25','temporary'),('370f143c-17fe-4df4-b2d6-f75ed4a97a99','okxVv13ST31ZbsGEAP-P9Pcd5auA',NULL,'川哥','张海川','https://api.129club.cloud/user_avatars/2025/11/1763381476214_klx7px.jpg',NULL,7,'[\"LW\",\"RW\",\"CF\",\"GK\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:10:30','2025-11-17 12:47:35','temporary'),('37a97715-d228-479b-a032-e04e24b43ae7','okxVv11XuaDN6fzdbHH1OHYFdung',NULL,'马培才','马培才','https://api.129club.cloud/user_avatars/2025/11/1763382711153_y464q9.jpeg',NULL,27,'[\"RB\",\"RW\",\"CB\"]',1,5,'member','active',NULL,NULL,'2025-11-17 11:54:50','2025-11-17 12:32:05','temporary'),('407b88e4-d9cf-4c78-bff5-85e4fa868eca','okxVv13GdYjUug5lHcP-P7fMK74E',NULL,'曾鹏','曾鹏','https://api.129club.cloud/user_avatars/2025/11/1763367057306_ondajm.jpeg',NULL,38,'[\"CB\"]',0,1,'captain','active','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','2025-11-17','2025-11-17 08:10:51','2025-11-17 09:04:33','temporary'),('41097aab-54bd-4800-84cf-f79e8f7d3d2b','okxVv103EgHeB3uaE92X241bTwRQ',NULL,'巴国城小胖子','邱帅','https://api.129club.cloud/user_avatars/2025/11/1763381010387_6bmpu8.jpg',NULL,33,'[\"LB\",\"RB\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:01:44','2025-11-17 12:03:31','temporary'),('5d8d2d9a-19f4-4896-abd3-304c0704b483','okxVv1686kd9QTeAZQngr-jOzwp0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'member','inactive',NULL,NULL,'2025-11-17 05:58:59','2025-11-17 06:22:46','temporary'),('63fe6ebf-4360-4840-a567-2b46d7237bf9','okxVv1-FqbAPZbStnouW3XiZQjXg',NULL,'南岸卡西利亚斯','曾晨','https://api.129club.cloud/user_avatars/2025/11/1763381010913_upn081.jpg',NULL,96,'[\"GK\"]',1,3,'member','active',NULL,NULL,'2025-11-17 12:02:40','2025-11-17 12:04:25','temporary'),('6a1ea615-5f87-4e6a-bc3a-214ee9a48646','okxVv1_m8zBdtKlLtghzHc4s76bk',NULL,'幺','王凌云','https://api.129club.cloud/user_avatars/2025/11/1763382959723_cwitq1.jpg',NULL,10,'[\"CDM\",\"RW\",\"CB\"]',2,5,'member','active',NULL,NULL,'2025-11-17 12:10:36','2025-11-17 12:36:02','temporary'),('71d7ab1d-1674-4f0f-8a81-d0348f45ed83','okxVv10PhpewphVw9NHaS-11ZB9c',NULL,'罗纳尔多','廖鹏','https://api.129club.cloud/user_avatars/2025/11/1763382246582_f8duw8.webp',NULL,49,'[\"LW\",\"RW\"]',2,5,'member','active',NULL,NULL,'2025-11-17 12:23:48','2025-11-17 12:24:47','temporary'),('7ac814ea-1d64-4878-a68e-cbba2cf028e8','okxVv11ZzXTZvOevlwK01QvwuytY',NULL,'诚友小朱','朱静','https://api.129club.cloud/user_avatars/2025/11/1763381186400_o4w4ui.jpg',NULL,85,'[\"CB\",\"LB\",\"RB\",\"CDM\",\"CAM\",\"RW\",\"LW\",\"CF\"]',1,1,'member','active',NULL,NULL,'2025-11-17 12:01:42','2025-11-17 12:06:53','temporary'),('7dda9b5f-62ca-4e98-a44d-943cb982c684','okxVv1xVuCz5yZ2vX9Rx0F5eVBuo',NULL,'Young','罗阳','https://api.129club.cloud/user_avatars/2025/11/1763381026138_0v3umf.jpg',NULL,29,'[\"CF\",\"LW\",\"CDM\",\"RW\",\"CAM\"]',1,1,'member','active',NULL,NULL,'2025-11-17 12:02:41','2025-11-17 12:04:17','temporary'),('7ed26a6f-f796-4823-983e-8133ecb4f1bd','okxVv11n7dMC46wpfvs49fBU-OwA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,'member','inactive',NULL,NULL,'2025-11-17 05:58:59','2025-11-17 06:22:47','temporary'),('7fbeef0d-dd93-457b-a259-16e869430e28','okxVv13putqNZO0sQrbiTajGw75I',NULL,'啊啊喔','曹枫','https://api.129club.cloud/user_avatars/2025/11/1763380818159_x22tcw.jpg',NULL,19,'[\"RB\",\"LW\",\"RW\",\"LB\"]',3,5,'member','active',NULL,NULL,'2025-11-17 10:16:58','2025-11-17 12:02:12','temporary'),('84e2f056-3854-41e6-9941-25f9a428fcda','okxVv1-n-xPsZ8Bvk4snm6qGTsTY',NULL,'杨涛','杨涛','https://api.129club.cloud/user_avatars/2025/11/1763382147193_njpcus.jpg',NULL,87,'[\"GK\",\"CB\",\"LB\",\"RB\"]',1,5,'member','active',NULL,NULL,'2025-11-17 12:08:23','2025-11-17 12:23:14','temporary'),('8cd7500c-c95e-4f3e-b776-c9bfaa5c0235','okxVv1ySewYT-wA3YIpssQp6VLTw',NULL,'然大大','陈然','https://api.129club.cloud/user_avatars/2025/11/1763381388858_ouf61b.jpeg',NULL,18,'[\"CF\",\"RB\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:09:10','2025-11-17 12:09:49','temporary'),('8cf4f261-5ddb-446b-9064-dacbe9c59f1f','okxVv15hQhueU8ARLqsMnpXSHhCk',NULL,'二塘坎特','张正祥','https://api.129club.cloud/user_avatars/2025/11/1763381451682_4nb6oe.jpg',NULL,3,'[\"CB\",\"LB\",\"RB\",\"LW\",\"RW\",\"CDM\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:10:45','2025-11-17 12:11:41','temporary'),('8cf5f4ad-3159-41e2-942f-b77804afe972','okxVv12CLeNOOpHA1hgl6Z3LWDzE',NULL,'李云鹏','李云鹏','https://api.129club.cloud/user_avatars/2025/11/1763380959353_wtdbaq.jpeg',NULL,10,'[\"CF\",\"CAM\",\"CDM\",\"CB\"]',0,5,'member','active',NULL,NULL,'2025-11-17 12:02:31','2025-11-17 12:03:08','temporary'),('9276f9f0-2df8-4db8-9d87-88f6e77f56d7','okxVv1wOEM6arWtJRuz5svxZLGs0',NULL,'黄泥塝卡恩','邹可','https://api.129club.cloud/user_avatars/2025/11/1763383953910_h7qusf.jpeg',NULL,0,'[\"GK\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:51:54','2025-11-17 12:52:35','temporary'),('942b0614-06e4-4e35-acd8-52f806a9a5c7','okxVv1z1t0DVfyOyc-uL94jJEbYo',NULL,'小刘','刘立希','https://api.129club.cloud/user_avatars/2025/11/1763359810151_e77vaj.jpeg',NULL,65,'[\"RB\",\"LB\",\"RW\",\"LW\"]',1,5,'super_admin','active','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','2025-11-17','2025-11-17 06:10:00','2025-11-17 12:43:08','temporary'),('9bb0beb2-1810-466e-9e60-713a82f2c6df','okxVv14MkJjr5bRyBNjbkw2XWJ1Y',NULL,'黄泥磅斯凯利','黄波','https://api.129club.cloud/user_avatars/2025/11/1763368420602_r3b45t.jpeg',NULL,11,'[\"LB\",\"CDM\",\"LW\"]',5,2,'member','active','b6ab3e9b-7bd7-468f-ae54-51c7675831e3','2025-11-17','2025-11-17 08:33:29','2025-11-17 10:32:50','temporary'),('9c0ccbee-c7a4-4da5-9147-7e117f9eb16a','okxVv11zEjF6rSlRp0wtliLiOLvI',NULL,'福子','孙福临','https://api.129club.cloud/user_avatars/2025/11/1763381481741_mhuiqp.jpg',NULL,4,'[\"CB\",\"LB\",\"RB\",\"CDM\",\"CAM\",\"LW\",\"RW\",\"CF\"]',2,5,'member','active',NULL,NULL,'2025-11-17 12:10:45','2025-11-17 12:11:53','temporary'),('cef30ce9-504f-48fe-9bee-b6c66b61db77','okxVv12K1s8sIXZ7NEQFtXDjP4hk',NULL,'QIN','覃文波','https://api.129club.cloud/user_avatars/2025/11/1763383859023_1gyjmh.jpg',NULL,23,'[\"CAM\",\"CDM\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:50:10','2025-11-17 12:51:05','temporary'),('d00e587b-de8f-44d5-b716-9d7860266be6','okxVv14F-SLRqYRx1g_3G8_FBscc',NULL,'汽博哈兰德','杨文华','https://api.129club.cloud/user_avatars/2025/11/1763383069778_rd81uu.jpg',NULL,17,'[\"CB\",\"LB\",\"RB\",\"CDM\",\"CAM\",\"LW\",\"RW\",\"CF\"]',3,5,'member','active',NULL,NULL,'2025-11-17 12:30:22','2025-11-17 12:38:10','temporary'),('d79a0e39-d5cc-41a0-afac-ae59da779797','okxVv17aTp5pjtA-VXkJHDcjB2jU',NULL,'大渡口坎比亚索','余信','https://api.129club.cloud/user_avatars/2025/11/1763380685601_qsggyl.jpeg',NULL,12,'[\"RB\",\"LB\"]',1,1,'member','active',NULL,NULL,'2025-11-17 11:57:12','2025-11-17 11:58:29','temporary'),('d8d70e63-fe1b-4a73-9b1c-93d68d259e99','okxVv1zTM4n7773cg7togL5pYlYY',NULL,'二哥','徐翔','https://api.129club.cloud/user_avatars/2025/11/1763381377826_pnmtus.jpeg',NULL,14,'[\"CB\",\"LB\",\"RB\",\"CDM\",\"CAM\",\"LW\",\"RW\"]',5,5,'member','active',NULL,NULL,'2025-11-17 12:08:26','2025-11-17 12:09:44','temporary'),('e18ad310-339b-48b4-8745-58630b87ba3d','okxVv140amwFakUCd400f-JGJW-E',NULL,'蒲海瑞','蒲海瑞','https://api.129club.cloud/user_avatars/2025/11/1763381330242_dxt43x.jpeg',NULL,68,'[\"RB\",\"LB\",\"RW\"]',0,1,'member','active',NULL,NULL,'2025-11-17 12:05:34','2025-11-17 13:04:56','temporary'),('f6f0089f-906c-440f-ac5c-68b479e13133','okxVv1-xRoql0KbFBCc6r-cllMkM',NULL,'小猪','朱荣峥','https://api.129club.cloud/user_avatars/2025/11/1763381923494_lj4pqf.jpg',NULL,4,'[\"CAM\"]',2,5,'member','active',NULL,NULL,'2025-11-17 12:17:33','2025-11-17 12:19:48','temporary'),('fc5f3bf4-bcaf-4a07-a529-28c6cf6f622a','okxVv1y3vgWtj9ID3PIbuU9ZjM-o',NULL,'张9','张欣','https://api.129club.cloud/user_avatars/2025/11/1763381158221_z5tu70.jpg',NULL,9,'[\"LW\"]',5,5,'member','active',NULL,NULL,'2025-11-17 12:05:51','2025-11-17 12:08:05','temporary');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-17 21:18:09
