/*
 Navicat Premium Dump SQL

 Source Server         : Local
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : 129club

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 12/11/2025 15:07:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for achievements
-- ----------------------------
DROP TABLE IF EXISTS `achievements`;
CREATE TABLE `achievements`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `icon` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `type` enum('single_match','cumulative','streak') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'single_match',
  `condition` json NULL,
  `is_season_bound` tinyint(1) NULL DEFAULT 0,
  `is_repeatable` tinyint(1) NULL DEFAULT 0,
  `sort_order` int NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_code`(`code` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of achievements
-- ----------------------------
INSERT INTO `achievements` VALUES ('1419c44b-ced4-4c8f-86e8-06ff3f3231c7', 'goal_machine', '进球机器', 'Score 10 goals in the season', '/static/images/goal-machine.png', 'cumulative', '{\"field\": \"goals\", \"value\": 10, \"operator\": \">=\"}', 1, 0, 5, 1, '2025-10-20 22:16:50', '2025-10-22 09:33:46');
INSERT INTO `achievements` VALUES ('3dbd056d-3118-4710-80ca-47d708c69625', 'hat_trick', '帽子戏法', 'Score 3 goals in a single match', '/static/images/hat-trick.png', 'single_match', '{\"field\": \"goals\", \"value\": 3, \"operator\": \">=\"}', 1, 1, 1, 1, '2025-10-20 22:16:50', '2025-10-22 09:33:46');
INSERT INTO `achievements` VALUES ('467aaca6-8016-4703-a1e1-4d2d05061994', 'perfect_attendance', '全勤奖', '100% attendance rate in the season', '/static/images/perfect-attendence.png', 'cumulative', '{\"field\": \"attendance\", \"value\": 100, \"operator\": \">=\"}', 1, 0, 3, 1, '2025-10-20 22:16:50', '2025-10-22 09:33:46');
INSERT INTO `achievements` VALUES ('48cb9e16-4137-4006-b774-a7829c79708b', 'winning_streak', '连胜王', 'Win 3 matches in a row', '/static/images/winning-streak.png', 'streak', '{\"field\": \"consecutive_wins\", \"value\": 3, \"operator\": \">=\"}', 1, 1, 6, 1, '2025-10-20 22:16:50', '2025-10-22 09:33:46');
INSERT INTO `achievements` VALUES ('ab18c592-ef34-4dca-a577-75a08e59e4c4', 'assist_king', '助攻王', 'Make 3 assists in a single match', '/static/images/assist-king.png', 'single_match', '{\"field\": \"assists\", \"value\": 3, \"operator\": \">=\"}', 1, 1, 2, 1, '2025-10-20 22:16:50', '2025-10-22 09:33:46');
INSERT INTO `achievements` VALUES ('b8e8584b-48fc-4e46-9429-775b5dcf3baa', 'mvp_collector', 'MVP收集者', 'Win MVP 5 times in the season', '/static/images/mvp-collector.png', 'cumulative', '{\"field\": \"mvp_count\", \"value\": 5, \"operator\": \">=\"}', 1, 0, 4, 1, '2025-10-20 22:16:50', '2025-10-22 09:33:46');

-- ----------------------------
-- Table structure for draft_picks
-- ----------------------------
DROP TABLE IF EXISTS `draft_picks`;
CREATE TABLE `draft_picks`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '选人记录ID',
  `reshuffle_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '重组ID',
  `round` int NOT NULL COMMENT '轮次',
  `pick_order` int NOT NULL COMMENT '选人顺序',
  `captain_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队长ID',
  `picked_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '被选中的用户ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `picked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '选择时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `captain_id`(`captain_id` ASC) USING BTREE,
  INDEX `picked_user_id`(`picked_user_id` ASC) USING BTREE,
  INDEX `team_id`(`team_id` ASC) USING BTREE,
  INDEX `idx_reshuffle`(`reshuffle_id` ASC) USING BTREE,
  INDEX `idx_round`(`round` ASC) USING BTREE,
  CONSTRAINT `draft_picks_ibfk_1` FOREIGN KEY (`reshuffle_id`) REFERENCES `team_reshuffles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `draft_picks_ibfk_2` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `draft_picks_ibfk_3` FOREIGN KEY (`picked_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `draft_picks_ibfk_4` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Draft选人记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of draft_picks
-- ----------------------------

-- ----------------------------
-- Table structure for lineups
-- ----------------------------
DROP TABLE IF EXISTS `lineups`;
CREATE TABLE `lineups`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '阵容ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `position` enum('GK','DF','MF','FW','SUB') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '场上位置',
  `jersey_number` int NULL DEFAULT NULL COMMENT '球衣号码',
  `is_starter` tinyint(1) NULL DEFAULT 1 COMMENT '是否首发',
  `set_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设置者ID（队长）',
  `set_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '设置时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_match_team_user`(`match_id` ASC, `team_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `set_by`(`set_by` ASC) USING BTREE,
  INDEX `idx_match`(`match_id` ASC) USING BTREE,
  INDEX `idx_team`(`team_id` ASC) USING BTREE,
  CONSTRAINT `lineups_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lineups_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `lineups_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `lineups_ibfk_4` FOREIGN KEY (`set_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛阵容表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lineups
-- ----------------------------

-- ----------------------------
-- Table structure for match_events
-- ----------------------------
DROP TABLE IF EXISTS `match_events`;
CREATE TABLE `match_events`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '事件ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `event_type` enum('goal','assist','save','yellow_card','red_card','substitution_in','substitution_out','referee') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '事件类型（新增save扑救、referee裁判）',
  `minute` int NULL DEFAULT NULL COMMENT '发生时间（分钟）',
  `assist_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '助攻者ID（进球事件）',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `recorded_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '记录者ID',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  `quarter_number` tinyint NULL DEFAULT NULL COMMENT '发生在第几节（1-4）',
  `event_subtype` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '事件子类型（如：far_shot远射, penalty点球）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `team_id`(`team_id` ASC) USING BTREE,
  INDEX `assist_user_id`(`assist_user_id` ASC) USING BTREE,
  INDEX `recorded_by`(`recorded_by` ASC) USING BTREE,
  INDEX `idx_match`(`match_id` ASC) USING BTREE,
  INDEX `idx_type`(`event_type` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `match_events_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_4` FOREIGN KEY (`assist_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_events_ibfk_5` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛事件表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of match_events
-- ----------------------------
INSERT INTO `match_events` VALUES ('07660686-8a77-469f-95ca-2772e04f4e8a', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'goal', 6, NULL, '', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 21:53:00', 2, NULL);
INSERT INTO `match_events` VALUES ('188318a1-cec6-49ba-a08b-c4747854d195', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '0609948d-318d-418f-8c48-db729f4dbe5c', 'goal', 1, '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', '', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 21:51:54', 1, NULL);
INSERT INTO `match_events` VALUES ('8ca36dbf-34e9-4789-8bc6-c47853dd44d5', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'goal', 3, NULL, '', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 21:53:14', 3, 'own_goal');
INSERT INTO `match_events` VALUES ('9b81dc6f-3464-4049-8842-03248ca5213c', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'goal', 7, NULL, '', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 21:53:24', 4, NULL);
INSERT INTO `match_events` VALUES ('c641cd00-c5a1-485d-b34b-3be6333b0b04', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'goal', 3, 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', '', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 21:52:53', 2, NULL);
INSERT INTO `match_events` VALUES ('ee851887-1320-4a11-ac48-85d07d007275', '10edf456-d68f-408e-a754-e3a58d3b535b', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '0609948d-318d-418f-8c48-db729f4dbe5c', 'goal', 1, NULL, '', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-23 17:47:00', 1, NULL);

-- ----------------------------
-- Table structure for match_participants
-- ----------------------------
DROP TABLE IF EXISTS `match_participants`;
CREATE TABLE `match_participants`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `match_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `is_present` tinyint(1) NULL DEFAULT 1 COMMENT '是否到场',
  `arrival_time` timestamp NULL DEFAULT NULL COMMENT '到场时间',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_match_team_user`(`match_id` ASC, `team_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `idx_match_id`(`match_id` ASC) USING BTREE,
  INDEX `team_id`(`team_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `match_participants_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_participants_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_participants_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛到场人员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of match_participants
-- ----------------------------
INSERT INTO `match_participants` VALUES ('38706b5e-044d-473b-943c-76e9c11bbd42', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('4726435b-e414-4504-a408-97a088d79164', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('54954a9a-be1f-4636-ba09-a8e6f8aa0452', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('635b61b2-294c-4387-b175-cc0fbce270cc', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '0609948d-318d-418f-8c48-db729f4dbe5c', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('6742df56-958f-4cca-aeaa-5d9f989c6050', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('6c54c0dd-dc7b-4782-a617-d940fa72cd44', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('74d9fc20-d733-4b53-8f30-4c7fbae68d7a', '1234241a-a9e8-4eed-8736-41b9a533ed24', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('7f930ece-badf-49b8-a7a3-9c43810f5524', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('95f191c5-a707-44c8-8a3c-50c7a87c1bd5', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('a4a47002-6f29-472a-bbb4-9846936ee87d', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('b7ccdff1-25a6-46bd-80fe-84a362727718', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('d5fb8e36-0e23-4056-a67f-d8d1dca0592a', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('d6703ac7-7a74-448c-88a5-3e49fa14fb8c', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 1, NULL, NULL, '2025-10-22 22:03:31');
INSERT INTO `match_participants` VALUES ('f5082575-c854-4eeb-b7b4-4815db426e1f', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 1, NULL, NULL, '2025-10-22 22:03:31');

-- ----------------------------
-- Table structure for match_quarters
-- ----------------------------
DROP TABLE IF EXISTS `match_quarters`;
CREATE TABLE `match_quarters`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `match_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `quarter_number` tinyint NOT NULL COMMENT '节次编号 1-4',
  `team1_goals` int NULL DEFAULT 0 COMMENT '队伍1进球数',
  `team2_goals` int NULL DEFAULT 0 COMMENT '队伍2进球数',
  `team1_points` int NULL DEFAULT 0 COMMENT '队伍1本节得分（1或2分）',
  `team2_points` int NULL DEFAULT 0 COMMENT '队伍2本节得分（0、1或2分）',
  `duration_minutes` int NULL DEFAULT 20 COMMENT '节次时长（分钟）',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '本节文字总结',
  `status` enum('in_progress','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'in_progress' COMMENT '节次状态：in_progress=进行中, completed=已完成',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_match_quarter`(`match_id` ASC, `quarter_number` ASC) USING BTREE,
  INDEX `idx_match_id`(`match_id` ASC) USING BTREE,
  CONSTRAINT `match_quarters_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛节次表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of match_quarters
-- ----------------------------
INSERT INTO `match_quarters` VALUES ('88610b11-2fbe-4087-afe6-3a9595c94231', '10edf456-d68f-408e-a754-e3a58d3b535b', 1, 1, 0, 1, 0, 20, NULL, 'in_progress', '2025-10-23 17:47:00', '2025-10-23 17:47:00');
INSERT INTO `match_quarters` VALUES ('bcf8cb13-d82e-481f-b8e3-d28018695228', '1234241a-a9e8-4eed-8736-41b9a533ed24', 1, 1, 0, 1, 0, 20, NULL, 'completed', '2025-10-22 21:51:54', '2025-10-22 21:52:01');
INSERT INTO `match_quarters` VALUES ('f37347b6-9932-479e-a372-572f43477640', '1234241a-a9e8-4eed-8736-41b9a533ed24', 2, 0, 2, 0, 1, 20, NULL, 'completed', '2025-10-22 21:52:53', '2025-10-22 21:53:02');
INSERT INTO `match_quarters` VALUES ('f6145b91-9f06-4dcb-8a6d-2f7c0dfe364f', '1234241a-a9e8-4eed-8736-41b9a533ed24', 3, 1, 0, 2, 0, 20, NULL, 'completed', '2025-10-22 21:53:14', '2025-10-22 21:53:16');
INSERT INTO `match_quarters` VALUES ('fe1f9ab1-50eb-4a36-a14f-a8517069580a', '1234241a-a9e8-4eed-8736-41b9a533ed24', 4, 0, 1, 0, 2, 20, NULL, 'completed', '2025-10-22 21:53:24', '2025-10-22 21:53:25');

-- ----------------------------
-- Table structure for match_results
-- ----------------------------
DROP TABLE IF EXISTS `match_results`;
CREATE TABLE `match_results`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '结果ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `team1_score` int NOT NULL DEFAULT 0 COMMENT '队伍1得分',
  `team2_score` int NOT NULL DEFAULT 0 COMMENT '队伍2得分',
  `winner_team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '获胜队伍ID',
  `mvp_user_ids` json NULL COMMENT 'MVP用户ID数组',
  `photos` json NULL COMMENT '比赛照片URL数组',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '比赛总结',
  `submitted_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '提交者ID',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `quarter_system` tinyint(1) NULL DEFAULT 0 COMMENT '是否4节制',
  `team1_final_score` int NULL DEFAULT NULL COMMENT '队伍1最终得分（4节制）',
  `team2_final_score` int NULL DEFAULT NULL COMMENT '队伍2最终得分（4节制）',
  `team1_total_goals` int NULL DEFAULT NULL COMMENT '队伍1总进球数',
  `team2_total_goals` int NULL DEFAULT NULL COMMENT '队伍2总进球数',
  `raw_report` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '原始简报文本',
  `parsed_by_ai` tinyint(1) NULL DEFAULT 0 COMMENT '是否由AI解析导入',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `match_id`(`match_id` ASC) USING BTREE,
  INDEX `winner_team_id`(`winner_team_id` ASC) USING BTREE,
  INDEX `submitted_by`(`submitted_by` ASC) USING BTREE,
  CONSTRAINT `match_results_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `match_results_ibfk_2` FOREIGN KEY (`winner_team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `match_results_ibfk_4` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛结果表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of match_results
-- ----------------------------
INSERT INTO `match_results` VALUES ('927a184b-b2c2-4b7b-836d-4fd664d48032', '1234241a-a9e8-4eed-8736-41b9a533ed24', 2, 3, NULL, '[\"c3c8aa05-e8dd-45ca-b56e-1901038b58d7\", \"6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4\"]', NULL, '雨中激战，进球盛宴！长江黄河与嘉陵摩托上演3-3进球大战\n\n在一场雨天的湿滑场地上，长江黄河队与嘉陵摩托队联袂奉献了一场精彩纷呈、一波三折的进球大战。双方梅花间竹般攻入六球，最终以3-3的比分握手言和，为观众带来了一场难忘的对攻战。\n\n比赛伊始，长江黄河队借主场之势先声夺人。开场仅第1分钟，吕超便送出一记精妙助攻，吴涛心领神会，轻松推射得手，帮助球队取得1-0的梦幻开局。\n\n然而，比赛的局势在第二节风云突变。嘉陵摩托队显然在中场休息后调整了战术，攻势如潮。他们先是在第3分钟由谭斌接孙鹏的助攻扳平比分，随后在第6分钟，冯军凭借个人能力，可能是一脚石破天惊的远射或是灵巧的内切破门，再下一城。短短几分钟内，嘉陵摩托便连入两球，以0-2的比分反超本节，总比分变为1-2。\n\n易边再战，第三节比赛充满了戏剧性。第3分钟，长江黄河队持续施压，造成嘉陵摩托队后卫崔建在慌乱中不慎自摆乌龙，打入一粒“戏剧性的乌龙球”。这个意外的进球让长江黄河队在本节以1-0取胜，并将总比分顽强地扳为2-2平。\n\n决定胜负的第四节，气氛愈发紧张。就在众人以为比赛将以平局收场时，嘉陵摩托队的王磊站了出来。他在第7分钟攻入关键一球，帮助球队在本节以0-1领先。尽管长江黄河队在总比分上再次落后，但他们并未放弃，在随后的比赛中发动了猛烈反扑，并成功再入一球，最终将全场比分定格在3-3。\n\n此役，双方联袂贡献了6粒进球，过程跌宕起伏，既有开场闪击，也有迅速反超，更有乌龙球和关键时刻的绝平球。最终，一场雨中的进球盛宴以平局收场，双方各取一分，可谓是一场没有输家的经典对决。', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 23:30:46', 1, 3, 3, 2, 3, NULL, 0);

-- ----------------------------
-- Table structure for matches
-- ----------------------------
DROP TABLE IF EXISTS `matches`;
CREATE TABLE `matches`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛标题',
  `team1_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍1 ID',
  `team2_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍2 ID',
  `match_date` timestamp NOT NULL COMMENT '比赛时间',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '比赛地点',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '比赛说明',
  `status` enum('upcoming','registration','lineup_set','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'upcoming' COMMENT '比赛状态',
  `registration_deadline` timestamp NULL DEFAULT NULL COMMENT '报名截止时间',
  `max_players_per_team` int NULL DEFAULT 11 COMMENT '每队最多报名人数',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `quarter_system` tinyint(1) NULL DEFAULT 0 COMMENT '是否使用4节制（true=4节制，false=传统全场制）',
  `final_team1_score` int NULL DEFAULT 0 COMMENT '队伍1最终得分（4节制累计分数）',
  `final_team2_score` int NULL DEFAULT 0 COMMENT '队伍2最终得分（4节制累计分数）',
  `season_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '所属赛季ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_match_date`(`match_date` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_team1`(`team1_id` ASC) USING BTREE,
  INDEX `idx_team2`(`team2_id` ASC) USING BTREE,
  INDEX `idx_season_id`(`season_id` ASC) USING BTREE,
  CONSTRAINT `fk_matches_season` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of matches
-- ----------------------------
INSERT INTO `matches` VALUES ('10edf456-d68f-408e-a754-e3a58d3b535b', '第一届两江超级联赛 第2场', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '2025-10-23 08:00:00', '轨道基地', NULL, 'in_progress', NULL, 8, '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 22:08:11', '2025-10-23 17:47:00', 1, 1, 0, 'ed6cba6b-5e8e-4985-a674-e2d8701a1171');
INSERT INTO `matches` VALUES ('1234241a-a9e8-4eed-8736-41b9a533ed24', '第一届两江超级联赛 第1场', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '2025-10-22 08:00:00', '轨道基地', NULL, 'completed', NULL, 8, '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 09:36:21', '2025-10-22 21:53:50', 1, 3, 3, 'ed6cba6b-5e8e-4985-a674-e2d8701a1171');
INSERT INTO `matches` VALUES ('f56a9312-44e4-4992-9e60-07e632241aec', '第一届两江超级联赛 第3场', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '2025-10-25 08:00:00', '轨道基地', NULL, 'in_progress', NULL, 8, '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-23 18:24:48', '2025-11-04 00:29:07', 1, 0, 0, 'ed6cba6b-5e8e-4985-a674-e2d8701a1171');

-- ----------------------------
-- Table structure for notices
-- ----------------------------
DROP TABLE IF EXISTS `notices`;
CREATE TABLE `notices`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '公告ID',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '内容',
  `type` enum('announcement','match','team','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'announcement' COMMENT '类型',
  `priority` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'medium' COMMENT '优先级',
  `is_pinned` tinyint(1) NULL DEFAULT 0 COMMENT '是否置顶',
  `publisher_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '发布者ID',
  `published_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT '过期时间',
  `view_count` int NULL DEFAULT 0 COMMENT '查看次数',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `publisher_id`(`publisher_id` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_published`(`published_at` ASC) USING BTREE,
  INDEX `idx_pinned`(`is_pinned` ASC) USING BTREE,
  CONSTRAINT `notices_ibfk_1` FOREIGN KEY (`publisher_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '公告表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notices
-- ----------------------------
INSERT INTO `notices` VALUES ('2c3aca39-a7ba-4e5e-9554-3485fbd9ba70', 'Welcome', 'First announcement', 'announcement', 'high', 1, '4b715272-e350-47bf-b436-b0fe8ecfb386', '2025-10-16 16:15:17', NULL, 1);

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('achievement','match','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `data` json NULL,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `is_shown` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_read`(`user_id` ASC, `is_read` ASC) USING BTREE,
  INDEX `idx_user_shown`(`user_id` ASC, `is_shown` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES ('025e3bb5-9d20-4e43-8673-8c21e9f205c7', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('113143a5-03f3-466f-a7e7-fe244bee3db3', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('123a0c2b-e96e-4870-b066-f4414feab29d', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('1747400f-90ac-471f-be81-df322667a711', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('1774cf25-e6eb-4d70-afd8-49f5cee59186', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('19a0ef19-69f4-4ca1-8479-092d68f64efc', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('1b1b141e-a271-49d3-ba79-8014b3275242', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('1b3cfca8-1918-4bcb-88e3-db453a73cd37', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('1cd182a2-b70a-4e54-b6e6-e19f690bf30d', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('1da74a0e-1252-4581-9199-768320b4dbc3', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('1f244fed-04e7-470c-9a82-65074ed55d86', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('1f55f40d-1182-452b-b9fa-c3c8f757cbaa', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('2352f301-b85e-4db6-b75b-bb31f9278449', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('23a35d9d-cabf-4cea-9d40-93dc73581f1b', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('23a8cf81-3934-4a38-b418-aec42a5dc762', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('2464d0c5-dbb7-49c3-87c0-e8403ea92364', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('259c4043-7e90-43c7-a494-c26aecb0a471', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('25ebf413-b0b4-4f6d-84b5-331f7f580c3c', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('263afcdb-e65e-45e6-b223-8c30625c1ad8', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('26483404-a7a9-4f1f-b560-5fa07d8d7b69', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('271a5146-1828-4de4-b047-f30fe1994e99', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('2754b7dc-b6d2-42b8-87a9-4b1179c4bcdd', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('27d527db-cdd8-4f61-88f0-c1d4d874768f', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('28061a57-b93e-491f-a36c-e318718a6f00', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('2bfcbfde-0f91-45fc-a280-3558e5595567', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('2f237b3b-5f5d-470f-a3f9-7e61d4498913', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('31d8c9f7-dfa4-4d8e-8e13-5adbb71ff3f8', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('33a895e1-15c6-4071-9b1a-873e172894e5', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('361cd5c2-14f1-4573-93ca-1a4effb48709', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('38b7d6c3-6cee-4052-a929-2dd28cbd0f70', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('396a7a92-733a-4b46-85b5-4170513c6c61', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('3ab2167f-d72a-4a9b-a6f8-24d7423dad7e', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('3b2b8e03-55c4-416c-964f-25f2240c926d', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('3bc4fe02-4cbf-4775-9ccf-3073f0ad4234', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('3d5c1728-08cb-49a3-8cee-fa7554fa8f84', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('3dfe3a6d-e759-49c0-94a2-ce5f5d8a2614', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('4057a4d8-cf35-4fc6-9c90-957b20b3a8c1', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('40595afe-20a3-4427-9f21-2f3144161604', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('43f8f51f-23fa-4afb-8e25-8f65ab9fc500', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('4421a431-4436-45e2-879d-2f140d5da053', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('475afd0a-b14f-457e-9521-262a419c6a96', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('4838c826-4392-400b-944e-3cf2e492a74c', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('494dbc08-7b46-4687-a385-b88d79d56953', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('4a6ac3fe-9596-463d-8dc2-0b2203cbc52d', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('4a7c3a0c-57e9-4864-9960-489b8d54beb7', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('4c5ba6e2-342b-484f-a8d3-a75718b1a973', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('4d9490d4-6890-4acf-afec-415e1e9b563a', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('51318f01-ff2b-4bec-9417-900fc2e1922c', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('52a13ac2-f5db-4b20-8ed9-5a770503b03e', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('5326e69a-bca8-4e1f-b478-12ab1ec195da', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('573872da-019b-478f-a75e-92a89dd163dc', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('57fac032-cfbf-46d6-8245-3cbad318d6b3', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('59979824-7922-475c-b0ad-59d86f3424b4', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('5a42b47c-63ec-49ce-9fce-46a810cb9390', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('5a61cfe7-211a-40b8-8beb-f02850a67244', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('5b272153-5874-4c81-84bf-1b3781af5be4', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('5e1d9b9a-bcf6-427a-90b5-9f3aac1de9d9', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('5ef10d75-91c0-459c-a146-d6fd2c3b12ae', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('66c69fd0-f0c5-47ce-be3f-ce3c2cbfea23', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('674c0998-d199-4835-993b-f5bb5814cf43', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('68283459-e34e-4ef8-a4d0-fbc7b2cdb8a2', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('6a00cdbb-f079-485f-b2ee-451457e5f53e', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('6b0a755a-bbd5-4910-8856-767440897480', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('6d106b42-6b56-4ccc-9de7-73f54601bc1b', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('6e27f8a6-e78d-45b8-9e6b-38f460f75163', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('7010c821-732d-471a-b99d-ca51d6d8daae', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('74157d78-f804-411c-995e-8b6519de28e6', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('749b3eb0-f45b-4a56-98bb-5193b5b0a736', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('75403882-bbe7-4d16-becb-adc09b457e8f', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('78d9b613-c098-4120-92ce-150dce117b0e', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('7a274628-7daf-4755-8208-b28e714227ab', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('7b3890a4-b99d-4931-9210-1f1c5a683e46', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('7b749c2a-9063-4aa0-a7d2-51a545e8549e', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('7d3e29dc-f243-4246-a45a-e7545d08c643', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('7e7c4513-c589-4553-a627-3c6a33689397', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('81ede1c3-d314-4698-9e60-2336d9fd3fcc', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('8283d688-74e5-4a82-a3aa-42ad4d1f3977', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('82cd0941-b536-4bf2-9831-d5a686cd1d85', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('84fe8862-e875-4715-b6d1-08381d6b5e52', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('86db6c68-c32d-413a-85e7-cbac9d2d6028', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('87e92bef-e044-41d9-8d35-f20b2e9b0666', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('889c9d8a-2785-40e6-80a0-15e3b2997546', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('88cb0525-8dfc-4f73-8159-6108730e9584', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('8aff4dcf-cff1-4cba-ae38-c18d49072c2f', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('8cfb336b-b2dc-4997-a81d-74dcd4d0714d', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('8d930991-c30f-4083-b662-eee222b25021', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('8f39101c-84d4-4345-8443-b676f4cf759e', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('8f405cce-4e7e-4485-95cd-08a2b8806eea', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('900f3052-d198-41b6-94c4-73a62bc60e5b', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('91850738-1a89-409d-a326-406ec8eae032', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('920e5238-48e3-41ec-a952-5a6175f27098', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('997edfa7-b2e1-4906-8ef5-83367289af2a', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('9c22844a-bb35-4afc-8215-bd3424832db6', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('9e262291-2494-4a41-94e0-e29e1839a51d', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('9edd897a-8544-4a3c-80b6-7852eac20db7', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('a28af562-45d5-4300-8c0e-c57513e83e85', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('a47f3c45-1d9e-4fc8-b9fa-e65f7d159ecb', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('a4a1d14b-4eb1-4ea5-9e8d-ffb87663df0f', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('a5943ea1-4c39-48a2-a7e5-d4485885837c', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('a7ce95be-4b59-4398-92ec-24bd651ac3db', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('a9a8b2c0-cec9-49c5-8e6a-da688a152c51', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('acad5b72-ce49-403d-ac19-82e32314b823', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('acfb1a05-5bb2-4c18-8d87-ed4e792ca8ad', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('ae8ad266-18cc-4aa9-ac5b-e216ab132ec2', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('afa97408-4e75-4593-bc7a-85fee0d1a699', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('afd85db5-7049-406a-8538-80b1e56cd7c3', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('b040ca03-884c-49f2-b7dd-7f00f551cce3', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('b22a433b-e83d-4a3d-9ed0-3d6ac3b95240', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('b5c8d940-ea60-40af-934c-929b9b77dafa', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('b7c56af1-467e-41b6-8b5f-957670e63b94', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('b9557098-9b46-4572-a9a4-7267e2c1fa51', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('b9ac406c-0aa5-43ec-904c-0ebcddd97f74', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('ba962f43-bde1-43d0-ba05-60df52fc9f61', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('bd411ccb-1c2f-4552-b1f5-27da9affb726', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('be2dabdc-8fed-420c-88b0-a18a435cada2', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('c09acfda-a1bf-4d87-a67e-a2533e40693a', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('c649c889-04da-40e5-a16d-3101f19e01a7', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('c7bd3e12-863f-40ec-9377-85edec6c0298', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('c91a1f6e-af0e-4ef4-b906-5b3cfd610f73', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('c9d3b9a4-6bd9-433a-8a1c-64d6b91f73f3', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('c9f9e62f-48de-4da4-a9e8-3266a012027d', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('cbcd164e-a1db-4cad-bbd1-191c4cba477f', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('cc2199bc-51ef-4011-b176-ccbfac8c82b0', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('d0314a2f-56c3-4cf5-8da6-f4654ee7e882', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('d0ad51a8-5a61-441c-af70-b88d1d20f115', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('d1be11cc-ffdf-4279-84c1-1138b391812e', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('d1ef7327-3050-4a64-a107-dbe5e3aa6e99', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('d3090e73-0ee1-4c2a-8153-783f18a7dc0d', '0609948d-318d-418f-8c48-db729f4dbe5c', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('d56f5442-8499-407a-a6aa-f912fc07445b', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('d80998f6-cb9c-4d23-a476-a34fd569e616', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('d8bdd7d6-4644-4c04-bce8-3b0fdde6cd33', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('d9583446-04b8-42cf-ad6a-eb25205f8b3b', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('d9990d1e-26ed-43b1-9183-0f1abab0a9fb', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('dfb8b74d-ad59-4495-bd2b-e6a7bb0fcabd', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('e0d2c294-93a4-4fb4-9446-b27a74196001', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('e364660a-241e-46e3-b973-f89071437a94', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('e457997b-a057-4dc9-a887-bbba894e0673', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('e65fef96-2fc8-45f4-b8d2-eaf4cb2da0bc', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('e7408214-e84a-47a4-bb4b-aa339f52589e', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('e7697f5b-dfcd-4576-9f37-9b2efc455367', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('e849fc60-3b8f-41cb-9955-76ec974434ef', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('e8ebb957-fd55-4981-8149-55f3b56fadb3', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('e9c91e5f-a608-457d-b23f-59c43988792f', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('ead8766b-3e13-4243-84b8-973123090404', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('ecb1731a-7eb1-47f5-820d-c1f37a2d7c4b', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('eddc8810-32cb-4e5f-b520-e1ec6d054821', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('f3090422-1d4d-47f7-81d9-4b96390a395a', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('f4ec9391-741b-4b7f-8312-49cc1118305e', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('f59cde2f-223a-4666-922c-49cb76997e21', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('f5bf174c-193a-4b5d-a5d1-c97d752e2bd5', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('f620e69b-f67c-41b6-9903-a8279447adc4', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('f64345e2-7c12-4944-bdad-3800902a1f13', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 2 time this season!', '{\"unlockCount\": 2, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:26');
INSERT INTO `notifications` VALUES ('f72643cc-836d-456a-b246-92b4b1eaeb73', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 全勤奖!', '{\"unlockCount\": 1, \"achievementId\": \"467aaca6-8016-4703-a1e1-4d2d05061994\", \"achievementCode\": \"perfect_attendance\", \"achievementIcon\": \"/static/images/perfect-attendence.png\", \"achievementName\": \"全勤奖\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('f876f79e-295b-4d08-a258-fe2aae4a312c', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('f8775073-5edb-4a3b-8fdb-4be3660ab88e', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('f8790743-947a-4c6a-a6e8-74253bd849a3', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 3 time this season!', '{\"unlockCount\": 3, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:54:46');
INSERT INTO `notifications` VALUES ('fab06fa8-4685-4e68-af22-9a2d9ed7f92b', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 助攻王 for the 5 time this season!', '{\"unlockCount\": 5, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 23:30:46');
INSERT INTO `notifications` VALUES ('fc833c3d-14a6-4b48-9dc5-63eeeb14f9f4', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have achieved 帽子戏法 for the 4 time this season!', '{\"unlockCount\": 4, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 22:14:35');
INSERT INTO `notifications` VALUES ('fc939482-2ed3-4dac-861a-dabff285c918', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 助攻王!', '{\"unlockCount\": 1, \"achievementId\": \"ab18c592-ef34-4dca-a577-75a08e59e4c4\", \"achievementCode\": \"assist_king\", \"achievementIcon\": \"/static/images/assist-king.png\", \"achievementName\": \"助攻王\"}', 0, 0, '2025-10-22 21:53:50');
INSERT INTO `notifications` VALUES ('ff2080ea-5971-4eec-b9e1-6ffe3f757e8b', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'achievement', 'Achievement Unlocked!', 'Congratulations! You have unlocked the achievement: 帽子戏法!', '{\"unlockCount\": 1, \"achievementId\": \"3dbd056d-3118-4710-80ca-47d708c69625\", \"achievementCode\": \"hat_trick\", \"achievementIcon\": \"/static/images/hat-trick.png\", \"achievementName\": \"帽子戏法\"}', 0, 0, '2025-10-22 21:53:50');

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `resource` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '资源名称',
  `action` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作类型 create/read/update/delete',
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',
  `granted_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '授权人ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_resource`(`resource` ASC) USING BTREE,
  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------

-- ----------------------------
-- Table structure for player_stats
-- ----------------------------
DROP TABLE IF EXISTS `player_stats`;
CREATE TABLE `player_stats`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '统计ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `matches_played` int NULL DEFAULT 0 COMMENT '参赛场次',
  `wins` int NULL DEFAULT 0 COMMENT '胜场',
  `draws` int NULL DEFAULT 0 COMMENT '平局',
  `losses` int NULL DEFAULT 0 COMMENT '负场',
  `goals` int NULL DEFAULT 0 COMMENT '进球数',
  `assists` int NULL DEFAULT 0 COMMENT '助攻数',
  `yellow_cards` int NULL DEFAULT 0 COMMENT '黄牌数',
  `red_cards` int NULL DEFAULT 0 COMMENT '红牌数',
  `mvp_count` int NULL DEFAULT 0 COMMENT 'MVP次数',
  `attendance_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '出勤率',
  `win_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '胜率',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_goals`(`goals` ASC) USING BTREE,
  INDEX `idx_assists`(`assists` ASC) USING BTREE,
  INDEX `idx_mvp`(`mvp_count` ASC) USING BTREE,
  CONSTRAINT `player_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '球员总体统计表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of player_stats
-- ----------------------------
INSERT INTO `player_stats` VALUES ('0dbc909e-8348-4f22-9897-5790cf933cfd', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('32ef5bd8-e870-4d94-8236-d41de2dd8d0c', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 1, 0, 0, 0, 1, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('440e3c56-793e-4cdc-846a-d6eb94ebb031', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.00, 0.00, '2025-11-04 16:48:28');
INSERT INTO `player_stats` VALUES ('679a80d0-0fcb-4e07-ad3e-e521ce6722eb', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.00, 0.00, '2025-11-04 16:48:28');
INSERT INTO `player_stats` VALUES ('67d281d5-5545-4875-8efb-081d2143c85f', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('73b7aec1-d7dc-46cd-bd81-13d80f71ee57', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 1, 0, 0, 0, 0, 1, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('98158075-0b12-4fdc-9d50-c9196b60352e', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('a045ca4b-a14d-421a-ac61-cdcbd086ed76', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 1, 0, 0, 0, 1, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('a0f60602-964f-4ea4-82d9-4276022a4bba', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 1, 0, 0, 0, 0, 1, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('a44b52d1-7bba-43d4-bee3-e50c5c45a4d6', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 1, 0, 0, 0, 1, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('a81bfb76-2790-4e42-944e-5066334c1fc3', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('b8f06f33-5150-4344-9bcd-108e6a50fe55', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('ceb1c3d6-d972-48f4-8575-52cf9bd9176b', '0609948d-318d-418f-8c48-db729f4dbe5c', 1, 0, 0, 0, 1, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('e54519d5-c5c7-4c60-a4d4-24bb731d94d2', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 1, 0, 0, 0, 1, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('e7600c23-d53d-4e86-9cda-fa21a30939d1', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');
INSERT INTO `player_stats` VALUES ('e86e7a42-de02-495b-ae43-f3b5a8d7da17', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 1, 0, 0, 0, 0, 0, 0, 0, 0, 100.00, 0.00, '2025-11-04 16:23:07');

-- ----------------------------
-- Table structure for player_team_stats
-- ----------------------------
DROP TABLE IF EXISTS `player_team_stats`;
CREATE TABLE `player_team_stats`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '统计ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季',
  `matches_played` int NULL DEFAULT 0 COMMENT '参赛场次',
  `wins` int NULL DEFAULT 0 COMMENT '胜场',
  `draws` int NULL DEFAULT 0 COMMENT '平局',
  `losses` int NULL DEFAULT 0 COMMENT '负场',
  `goals` int NULL DEFAULT 0 COMMENT '进球数',
  `assists` int NULL DEFAULT 0 COMMENT '助攻数',
  `yellow_cards` int NULL DEFAULT 0 COMMENT '黄牌数',
  `red_cards` int NULL DEFAULT 0 COMMENT '红牌数',
  `mvp_count` int NULL DEFAULT 0 COMMENT 'MVP次数',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_team_season`(`user_id` ASC, `team_id` ASC, `season` ASC) USING BTREE,
  INDEX `idx_team_season`(`team_id` ASC, `season` ASC) USING BTREE,
  CONSTRAINT `player_team_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `player_team_stats_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '球员队内统计表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of player_team_stats
-- ----------------------------

-- ----------------------------
-- Table structure for positions
-- ----------------------------
DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '位置ID',
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '位置编码',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '位置名称(中文)',
  `name_en` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '位置名称(英文)',
  `category` enum('GK','DF','MF','FW') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '位置大类',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '位置描述',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_code`(`code` ASC) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '位置字典表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of positions
-- ----------------------------
INSERT INTO `positions` VALUES (1, 'GK', '守门员', 'Goalkeeper', 'GK', 1, 1, '守门员');
INSERT INTO `positions` VALUES (2, 'CB', '中后卫', 'Center Back', 'DF', 10, 1, '中路防守核心');
INSERT INTO `positions` VALUES (3, 'LCB', '左中卫', 'Left Center Back', 'DF', 11, 0, '左侧中后卫');
INSERT INTO `positions` VALUES (4, 'RCB', '右中卫', 'Right Center Back', 'DF', 12, 0, '右侧中后卫');
INSERT INTO `positions` VALUES (5, 'LB', '左后卫', 'Left Back', 'DF', 13, 1, '左路防守');
INSERT INTO `positions` VALUES (6, 'RB', '右后卫', 'Right Back', 'DF', 14, 1, '右路防守');
INSERT INTO `positions` VALUES (7, 'LWB', '左边后卫', 'Left Wing Back', 'DF', 15, 0, '左路攻守兼备');
INSERT INTO `positions` VALUES (8, 'RWB', '右边后卫', 'Right Wing Back', 'DF', 16, 0, '右路攻守兼备');
INSERT INTO `positions` VALUES (9, 'SW', '清道夫', 'Sweeper', 'DF', 17, 0, '拖后中卫');
INSERT INTO `positions` VALUES (10, 'CDM', '后腰', 'Defensive Midfielder', 'MF', 20, 1, '防守型中场');
INSERT INTO `positions` VALUES (11, 'CM', '中前卫', 'Central Midfielder', 'MF', 21, 0, '中路组织');
INSERT INTO `positions` VALUES (12, 'CAM', '前腰', 'Attacking Midfielder', 'MF', 22, 1, '进攻型中场');
INSERT INTO `positions` VALUES (13, 'LM', '左前卫', 'Left Midfielder', 'MF', 23, 0, '左路中场');
INSERT INTO `positions` VALUES (14, 'RM', '右前卫', 'Right Midfielder', 'MF', 24, 0, '右路中场');
INSERT INTO `positions` VALUES (15, 'LW', '左边锋', 'Left Winger', 'FW', 25, 1, '左路进攻');
INSERT INTO `positions` VALUES (16, 'RW', '右边锋', 'Right Winger', 'FW', 26, 1, '右路进攻');
INSERT INTO `positions` VALUES (17, 'CF', '中锋', 'Center Forward', 'FW', 30, 1, '中路进攻核心');
INSERT INTO `positions` VALUES (18, 'ST', '前锋', 'Striker', 'FW', 31, 0, '射手');
INSERT INTO `positions` VALUES (19, 'LF', '左前锋', 'Left Forward', 'FW', 32, 0, '左路前锋');
INSERT INTO `positions` VALUES (20, 'RF', '右前锋', 'Right Forward', 'FW', 33, 0, '右路前锋');
INSERT INTO `positions` VALUES (21, 'SS', '影锋', 'Second Striker', 'FW', 34, 0, '前场自由人');

-- ----------------------------
-- Table structure for registrations
-- ----------------------------
DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '报名ID',
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '比赛ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID（报名时所属队伍）',
  `status` enum('registered','confirmed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'registered' COMMENT '报名状态',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_match_user`(`match_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `idx_match`(`match_id` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_team`(`team_id` ASC) USING BTREE,
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比赛报名表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of registrations
-- ----------------------------
INSERT INTO `registrations` VALUES ('2f587669-afcf-4a18-80a9-c929db8e3865', '1234241a-a9e8-4eed-8736-41b9a533ed24', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('385aa5a9-cdd4-46e6-aaed-5ad30404e34d', '1234241a-a9e8-4eed-8736-41b9a533ed24', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('3caf0dc0-4d5c-4984-808c-6cb5e3819897', '10edf456-d68f-408e-a754-e3a58d3b535b', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'registered', '2025-10-22 22:08:35', NULL);
INSERT INTO `registrations` VALUES ('43c483dd-c541-474c-af4a-e17c59982fee', '1234241a-a9e8-4eed-8736-41b9a533ed24', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('4858fec3-c0ff-4891-8ee6-715d29cec07d', '1234241a-a9e8-4eed-8736-41b9a533ed24', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 21:47:03', NULL);
INSERT INTO `registrations` VALUES ('5340397c-9e92-44c1-b101-dbc42b05bac6', '1234241a-a9e8-4eed-8736-41b9a533ed24', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('5f9926d2-fcb9-43e9-ae3c-81ac9c167500', '1234241a-a9e8-4eed-8736-41b9a533ed24', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('60aa4200-e060-496d-b38e-56fdd31c75f3', '1234241a-a9e8-4eed-8736-41b9a533ed24', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('6b6341e9-53b2-4f0b-a448-a5b8423f3093', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('6ee7e1ec-a8e4-4b28-9c2b-84e933855eed', '1234241a-a9e8-4eed-8736-41b9a533ed24', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('72228c1c-05ae-491e-9f00-7c1a66efbecc', '1234241a-a9e8-4eed-8736-41b9a533ed24', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('9f2f28a8-8f1a-48d5-b8d7-46d02b599870', '1234241a-a9e8-4eed-8736-41b9a533ed24', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('b93f7dad-8108-4428-b2fc-d2c4e4985cbd', '1234241a-a9e8-4eed-8736-41b9a533ed24', '0609948d-318d-418f-8c48-db729f4dbe5c', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('bd46b8a6-abbe-4430-a5cf-c996b5c6f7e4', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('c333a7c8-bf67-4736-b7f9-0ef25aa5bab2', '1234241a-a9e8-4eed-8736-41b9a533ed24', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('cb3ae320-9f32-4606-8be7-2c9b98a76f37', '1234241a-a9e8-4eed-8736-41b9a533ed24', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'confirmed', '2025-10-22 14:41:03', NULL);
INSERT INTO `registrations` VALUES ('fd23cc0b-72a7-4618-ab1f-52864a1dc0f0', '1234241a-a9e8-4eed-8736-41b9a533ed24', '399a4992-d14e-488a-9ece-0e0f8f36f9be', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', 'confirmed', '2025-10-22 14:41:03', NULL);

-- ----------------------------
-- Table structure for seasons
-- ----------------------------
DROP TABLE IF EXISTS `seasons`;
CREATE TABLE `seasons`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季名称，如2025-S1',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '赛季标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '赛季说明',
  `start_date` datetime NULL DEFAULT NULL COMMENT '赛季开始日期',
  `end_date` datetime NULL DEFAULT NULL COMMENT '赛季结束日期',
  `max_matches` int NULL DEFAULT 10 COMMENT '赛季最大比赛场数',
  `status` enum('upcoming','active','completed','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'upcoming' COMMENT '赛季状态',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建者ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_name`(`name` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_start_date`(`start_date` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '赛季表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of seasons
-- ----------------------------
INSERT INTO `seasons` VALUES ('ed6cba6b-5e8e-4985-a674-e2d8701a1171', '第一届两江超级联赛', '两江超级联赛', '第一届', '2025-10-20 08:00:00', NULL, 10, 'active', '5bc76f4f-a2a3-450a-9bee-6d0af2e9333e', '2025-10-20 10:33:10', NULL);

-- ----------------------------
-- Table structure for team_members
-- ----------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '关系ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `role` enum('captain','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'member' COMMENT '队内角色',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否在队',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_team`(`team_id` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE,
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '队伍成员关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of team_members
-- ----------------------------
INSERT INTO `team_members` VALUES ('09c2ef46-5a55-4be6-baa8-7565774cb5b8', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('1795ad06-29d6-4642-bcd1-a91919f8ad10', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('2ff8ead4-8d3d-4f53-b6ca-9ebc5658d5d2', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('306b5a51-ee8f-4e89-96dd-c9030624e22a', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('49ee0d90-5a04-494d-9515-1745d0824558', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '399a4992-d14e-488a-9ece-0e0f8f36f9be', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('70b26fd0-6ab2-4507-8c47-ced599c51839', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('85f3f671-66cf-4825-9f7d-d5220c148273', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('8dd6a844-bd6f-4fea-9ea3-9ce0a53bc1c2', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('903c44ae-a18c-441e-a0cf-7473e9e62a3e', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('ac6acec7-8728-4d97-b035-38d593b2be2d', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '0609948d-318d-418f-8c48-db729f4dbe5c', '2025-10-22 17:24:23', 'captain', 1);
INSERT INTO `team_members` VALUES ('b916f7e3-5963-43ba-ada3-6519fade3106', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('c71b82b2-2c2b-4b11-bc6e-64dfab21e401', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '2025-10-22 09:15:48', 'member', 1);
INSERT INTO `team_members` VALUES ('ddda22b5-aaae-4923-b562-8332fca737e9', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', '2025-10-22 17:24:23', 'captain', 1);
INSERT INTO `team_members` VALUES ('de6f5049-a8bb-43d8-9263-ae09d2ee7f84', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('eb105ea0-3feb-43d1-b1ad-6598eb71b222', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', '2025-10-22 17:24:23', 'member', 1);
INSERT INTO `team_members` VALUES ('eca9b80c-1d92-445f-86be-ef9bdf7628ea', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', '2025-10-22 17:24:23', 'member', 1);

-- ----------------------------
-- Table structure for team_reshuffles
-- ----------------------------
DROP TABLE IF EXISTS `team_reshuffles`;
CREATE TABLE `team_reshuffles`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '重组ID',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季',
  `initiator_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '发起人ID',
  `captain1_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队长1 ID',
  `captain2_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队长2 ID',
  `team1_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队伍1 ID',
  `team2_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队伍2 ID',
  `status` enum('draft_in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'draft_in_progress' COMMENT '状态',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `initiator_id`(`initiator_id` ASC) USING BTREE,
  INDEX `captain1_id`(`captain1_id` ASC) USING BTREE,
  INDEX `captain2_id`(`captain2_id` ASC) USING BTREE,
  INDEX `team1_id`(`team1_id` ASC) USING BTREE,
  INDEX `team2_id`(`team2_id` ASC) USING BTREE,
  INDEX `idx_season`(`season` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  CONSTRAINT `team_reshuffles_ibfk_1` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_2` FOREIGN KEY (`captain1_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_3` FOREIGN KEY (`captain2_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_4` FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `team_reshuffles_ibfk_5` FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '队伍重组记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of team_reshuffles
-- ----------------------------

-- ----------------------------
-- Table structure for team_stats
-- ----------------------------
DROP TABLE IF EXISTS `team_stats`;
CREATE TABLE `team_stats`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '统计ID',
  `team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季',
  `matches_played` int NULL DEFAULT 0 COMMENT '比赛场次',
  `wins` int NULL DEFAULT 0 COMMENT '胜场',
  `draws` int NULL DEFAULT 0 COMMENT '平局',
  `losses` int NULL DEFAULT 0 COMMENT '负场',
  `goals_for` int NULL DEFAULT 0 COMMENT '进球数',
  `goals_against` int NULL DEFAULT 0 COMMENT '失球数',
  `goal_difference` int NULL DEFAULT 0 COMMENT '净胜球',
  `points` int NULL DEFAULT 0 COMMENT '积分（胜3平1负0）',
  `win_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '胜率',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `team_id`(`team_id` ASC) USING BTREE,
  INDEX `idx_season`(`season` ASC) USING BTREE,
  INDEX `idx_points`(`points` ASC) USING BTREE,
  INDEX `idx_goals`(`goals_for` ASC) USING BTREE,
  CONSTRAINT `team_stats_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '队伍统计表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of team_stats
-- ----------------------------
INSERT INTO `team_stats` VALUES ('759a40c1-5138-4423-8544-741273488a88', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '第一届两江超级联赛', 1, 0, 1, 0, 2, 3, -1, 1, 0.00, '2025-10-23 18:07:59');
INSERT INTO `team_stats` VALUES ('fcb70efc-d13e-4060-9b09-dde04dcdec28', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '第一届两江超级联赛', 1, 0, 1, 0, 3, 2, 1, 1, 0.00, '2025-10-23 18:07:59');

-- ----------------------------
-- Table structure for teams
-- ----------------------------
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队伍ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '队名',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队徽URL',
  `captain_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队长ID',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '队伍主色调',
  `season` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '赛季/期数 如2025-S1',
  `status` enum('active','disbanded','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'active' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `disbanded_at` timestamp NULL DEFAULT NULL COMMENT '解散时间',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建者ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_season`(`season` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_captain`(`captain_id` ASC) USING BTREE,
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '队伍表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of teams
-- ----------------------------
INSERT INTO `teams` VALUES ('281a79c2-e10a-4bfa-8dc8-def0b7b7580a', '长江黄河', '/static/images/cjhh.png', '0609948d-318d-418f-8c48-db729f4dbe5c', '#934bb0', '第一届两江超级联赛', 'active', '2025-10-22 09:12:04', NULL, 'eb08d787-f522-44a0-a4db-d7f867fab92f');
INSERT INTO `teams` VALUES ('b6ab3e9b-7bd7-468f-ae54-51c7675831e3', '嘉陵摩托', '/static/images/jlmt.png', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', '#c10e15', '第一届两江超级联赛', 'active', '2025-10-22 09:12:04', NULL, 'eb08d787-f522-44a0-a4db-d7f867fab92f');

-- ----------------------------
-- Table structure for user_achievements
-- ----------------------------
DROP TABLE IF EXISTS `user_achievements`;
CREATE TABLE `user_achievements`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `achievement_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `season_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unlocked_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `match_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unlock_count` int NULL DEFAULT 1,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_achievement_season`(`user_id` ASC, `achievement_id` ASC, `season_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_achievement_id`(`achievement_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_achievements
-- ----------------------------
INSERT INTO `user_achievements` VALUES ('03b38f0c-49a0-42ee-88be-1f375e66af4c', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('089ac428-b1ad-49ef-a609-c5d5578e1bf3', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('098d1431-34ab-4b70-9619-0549518a4fd7', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('0adb70ba-f116-476b-8920-bee26ee8893c', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('135286d0-c503-405a-b4f5-de8baafea6dc', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('1de24d47-9fec-425f-bace-3e7da539fb02', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('23b62484-beb9-4bc0-b292-3aa78b027cd4', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('27459938-c747-4e32-b049-9d70d1e753fd', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('28d333b7-1c6f-4675-b939-1c8302fdcc54', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('29758a80-69bc-474c-8734-81e6b6c55d07', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('3342ede3-3750-4c11-8833-13eeb13b630b', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('3581a806-5745-4d9d-b3a7-c358f87be538', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('411b214a-c31e-4336-8f02-b35ad17d186f', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('43044561-0ecf-43f8-9183-d1cd5d8f0576', '399a4992-d14e-488a-9ece-0e0f8f36f9be', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('48a411bd-4400-4fe7-b262-f46885c72145', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('4f84f5ce-9251-42af-a734-8594fdf58fdc', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', '1234241a-a9e8-4eed-8736-41b9a533ed24', 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('50a71082-917c-48f3-ad5a-f69dd44708fd', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('533e34a0-45ce-4787-9e63-1838af7728d4', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('554cde4e-76c9-492c-9c20-bc4c63d3769d', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('579dcc25-7136-4f61-8d1d-30567eca9924', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('58206232-1bfe-441d-8e36-ea38dc1b14c0', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', '1234241a-a9e8-4eed-8736-41b9a533ed24', 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('582cc638-2a98-425b-878e-477877d0c220', '0609948d-318d-418f-8c48-db729f4dbe5c', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('58c470c4-bd2d-4d70-b4db-874010e64107', 'b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('5b73f2ac-8c5b-4443-8688-ad5e1b536a32', '8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('649a2037-9d64-42a0-b1df-00511d0abe77', '1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('65d80bc6-8793-4fe7-9b98-7d6f67129df5', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', '1234241a-a9e8-4eed-8736-41b9a533ed24', 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('6cc71317-d4cf-42f9-b9e8-1d2a8c6c9d10', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('70f6da9c-6cae-446c-a63f-2dbd3975ed92', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('7c5644f9-e292-4832-8626-a6c755254469', '0609948d-318d-418f-8c48-db729f4dbe5c', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('7df48ca1-477f-4ab1-99d7-64bf356a1537', '399a4992-d14e-488a-9ece-0e0f8f36f9be', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('8c727359-2032-412a-be3e-37e38c20426e', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('9a49c591-c9a1-44c6-bdff-3b3d0377295b', '0609948d-318d-418f-8c48-db729f4dbe5c', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('a0f06f9f-1da8-4b89-822a-47244bfe0c1c', '2f82d131-6e19-4fd3-9258-e514e1ae6e80', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('acf07496-7736-4694-8c95-f7a3acbcee49', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('b3470b84-7a97-4163-bb7c-2b55d2bce0fd', '44e4d614-0a57-4d14-9fc2-47de3602a84b', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('b44eebc3-849d-4666-8da5-9bee7079ea70', 'a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('bf77dee2-4431-471a-8a12-c5fec64cdfda', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('cf5615e6-cf5e-4cc2-86c0-bbc14a51e2f2', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('d38df7bc-0b73-4bc5-b6fa-43c533410de5', '44e4d614-0a57-4d14-9fc2-47de3602a84b', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('d44a585a-ecec-4ca6-bab4-be2d016071d1', '4abd69c8-1df1-481b-8a0e-5cb64265ff44', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', '1234241a-a9e8-4eed-8736-41b9a533ed24', 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('d95efba7-0498-4945-889a-7432f2cc0408', '3a6c64d0-b4d8-45da-903a-6d0e162df3d7', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('e1f04d09-99dc-4212-af28-a1e918418a7b', 'c3c8aa05-e8dd-45ca-b56e-1901038b58d7', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('e22adaa0-f3f3-492c-97e5-ee6eafd0363f', '8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('e293856d-b6db-4062-85f8-0abb2b40be85', '6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('e5068a8c-b251-4f99-bdd6-3b6fbcb8d521', '6e66bed9-3d63-45f9-9576-80dce9aa3f1a', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('edaa9dbc-34e9-4ccb-a0dd-e83da9285e60', '428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'ab18c592-ef34-4dca-a577-75a08e59e4c4', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');
INSERT INTO `user_achievements` VALUES ('f8e0d61e-95a8-4269-b989-3bb156ec454e', '53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', '467aaca6-8016-4703-a1e1-4d2d05061994', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 21:53:50', NULL, 1, '2025-10-22 21:53:50', '2025-10-22 21:53:50');
INSERT INTO `user_achievements` VALUES ('ffe552de-10c6-49b6-8eff-4a25aa4b006b', '399a4992-d14e-488a-9ece-0e0f8f36f9be', '3dbd056d-3118-4710-80ca-47d708c69625', 'ed6cba6b-5e8e-4985-a674-e2d8701a1171', '2025-10-22 23:30:46', '1234241a-a9e8-4eed-8736-41b9a533ed24', 5, '2025-10-22 21:53:50', '2025-10-22 23:30:46');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID (UUID)',
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '微信openid',
  `unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '昵称',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号',
  `jersey_number` int NULL DEFAULT NULL COMMENT '球衣号码',
  `position` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '场上位置编码JSON数组 (支持多选, 如 [\"CAM\",\"LW\",\"ST\"])',
  `left_foot_skill` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '左脚擅长程度(0-5)',
  `right_foot_skill` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '右脚擅长程度(0-5)',
  `role` enum('super_admin','captain','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'member' COMMENT '角色',
  `status` enum('active','inactive','leave') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'active' COMMENT '状态',
  `current_team_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '当前队伍ID',
  `join_date` date NULL DEFAULT NULL COMMENT '加入日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `member_type` enum('regular','temporary') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'temporary' COMMENT '队员类型（regular=正式队员, temporary=临时队员）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `openid`(`openid` ASC) USING BTREE,
  INDEX `idx_openid`(`openid` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_team`(`current_team_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('0609948d-318d-418f-8c48-db729f4dbe5c', 'test_user_008', NULL, '吴涛', '吴涛', '/static/images/avatar/1.png', '13800138008', 11, '[\"ST\"]', 3, 5, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:30:40', 'regular');
INSERT INTO `users` VALUES ('1b7a8b48-91aa-472d-90ed-fcdd92fdb21b', 'test_user_014', NULL, '吕超', '吕超', '/static/images/avatar/2.png', '13800138014', 17, '[\"ST\"]', 5, 3, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('2f82d131-6e19-4fd3-9258-e514e1ae6e80', 'test_user_005', NULL, '陈浩', '陈浩', '/static/images/avatar/3.png', '13800138005', 9, '[\"RW\"]', 3, 5, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('399a4992-d14e-488a-9ece-0e0f8f36f9be', 'test_user_013', NULL, '何斌', '何斌', '/static/images/avatar/4.png', '13800138013', 14, '[\"CAM\",\"RB\"]', 5, 4, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('3a6c64d0-b4d8-45da-903a-6d0e162df3d7', 'test_user_020', NULL, '邹涛', '邹涛', '/static/images/avatar/5.png', '13800138020', 16, '[\"ST\"]', 5, 1, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:30:40', 'regular');
INSERT INTO `users` VALUES ('428549ce-ad21-49f3-b00a-c0e9943fb0f3', 'test_user_004', NULL, '刘洋', '刘洋', '/static/images/avatar/6.png', '13800138004', 1, '[\"CM\"]', 5, 4, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:30:40', 'regular');
INSERT INTO `users` VALUES ('44e4d614-0a57-4d14-9fc2-47de3602a84b', 'okxVv1z1t0DVfyOyc-uL94jJEbYo', NULL, '小旋风', '刘立希', '/static/images/avatar/21.png', '13131313131', 66, '[\"LB\",\"RB\",\"RW\",\"LW\"]', 1, 5, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:42:45', '2025-11-04 21:45:00', 'temporary');
INSERT INTO `users` VALUES ('4abd69c8-1df1-481b-8a0e-5cb64265ff44', 'test_user_012', NULL, '许辉', '许辉', '/static/images/avatar/7.png', '13800138012', 15, '[\"CAM\"]', 5, 4, 'member', 'active', '281a79c2-e10a-4bfa-8dc8-def0b7b7580a', NULL, '2025-10-22 08:40:58', '2025-11-04 00:30:40', 'regular');
INSERT INTO `users` VALUES ('53b7cd6e-8cc6-4c4d-8b56-8fe53b80855f', 'test_user_006', NULL, '赵明', '赵明', '/static/images/avatar/8.png', '13800138006', 8, '[\"CDM\",\"CF\"]', 4, 5, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('6c97ae03-23a1-4e8d-a6ca-54ef1d93d9a4', 'test_user_019', NULL, '谭斌', '谭斌', '/static/images/avatar/9.png', '13800138019', 13, '[\"CAM\"]', 4, 5, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('6e66bed9-3d63-45f9-9576-80dce9aa3f1a', 'test_user_003', NULL, '王磊', '王磊', '/static/images/avatar/10.png', '13800138003', 5, '[\"LB\"]', 5, 2, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('8d07fd09-38d7-452f-9ea2-b74b22e616f9', 'test_user_010', NULL, '郑凯', '郑凯', '/static/images/avatar/11.png', '13800138010', 4, '[\"CB\"]', 5, 4, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('8f0b0665-0aac-4935-85c3-5e9c17f17e48', 'test_user_011', NULL, '冯军', '冯军', '/static/images/avatar/12.png', '13800138011', 2, '[\"LB\"]', 1, 5, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('a1aba0f0-f58a-44a1-a351-365d8e8545ff', 'test_user_018', NULL, '崔建', '崔建', '/static/images/avatar/13.png', '13800138018', 20, '[\"LB\"]', 5, 4, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('b4660611-bfee-4eeb-a10b-d6f69fdfea6a', 'test_user_009', NULL, '孙鹏', '孙鹏', '/static/images/avatar/14.png', '13800138009', 3, '[\"LB\"]', 5, 4, 'member', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('c3c8aa05-e8dd-45ca-b56e-1901038b58d7', 'test_user_001', NULL, '张伟', '张伟', '/static/images/avatar/15.png', '13800138001', 7, '[\"RW\"]', 4, 5, 'super_admin', 'active', 'b6ab3e9b-7bd7-468f-ae54-51c7675831e3', NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('c70b3419-c3f8-49f7-bf07-e5ad0a8b992f', 'test_user_017', NULL, '姜华', '姜华', '/static/images/avatar/16.png', '13800138017', 19, '[\"LW\",\"CDM\"]', 2, 5, 'member', 'active', NULL, NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'temporary');
INSERT INTO `users` VALUES ('d647d8d2-291a-46e7-a388-76bb7c5588b2', 'test_user_015', NULL, '丁勇', '丁勇', '/static/images/avatar/17.png', '13800138015', 12, '[\"CM\"]', 5, 5, 'member', 'active', NULL, NULL, '2025-10-22 08:40:58', '2025-11-04 00:30:40', 'temporary');
INSERT INTO `users` VALUES ('def6935d-e03a-454b-856d-730c091c3532', 'test_user_007', NULL, '周杰', '周杰', '/static/images/avatar/18.png', '13800138007', 6, '[\"CB\",\"CAM\"]', 5, 3, 'member', 'active', NULL, NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('eb08d787-f522-44a0-a4db-d7f867fab92f', 'test_user_002', NULL, '李强', '李强', '/static/images/avatar/19.png', '13800138002', 10, '[\"CAM\"]', 5, 0, 'member', 'active', NULL, NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'regular');
INSERT INTO `users` VALUES ('fd5cc8a1-2e7b-44f6-829c-38131a338f82', 'test_user_016', NULL, '任飞', '任飞', '/static/images/avatar/20.png', '13800138016', 18, '[\"CAM\"]', 5, 3, 'member', 'active', NULL, NULL, '2025-10-22 08:40:58', '2025-11-04 00:43:41', 'temporary');

SET FOREIGN_KEY_CHECKS = 1;
