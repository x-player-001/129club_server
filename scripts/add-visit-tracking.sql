-- ============================================
-- 添加用户访问记录功能
-- 方案2：纯日志方案（仅 user_visit_logs 表）
-- 说明：不在 users 表添加字段，所有统计通过聚合查询实现
-- ============================================

-- 创建访问日志表
CREATE TABLE IF NOT EXISTS `user_visit_logs` (
  `id` VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL PRIMARY KEY COMMENT '日志ID',
  `user_id` VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `visit_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  `visit_date` DATE NOT NULL COMMENT '访问日期（便于统计）',
  `platform` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '平台（iOS/Android/devtools）',
  `app_version` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '小程序版本号',
  `scene` INT NULL COMMENT '场景值（从哪里进入小程序）',
  `ip_address` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'IP地址',
  `device_model` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '设备型号',
  `system_version` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '操作系统版本',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_visit_date` (`visit_date`),
  INDEX `idx_visit_time` (`visit_time`),

  CONSTRAINT `fk_visit_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='用户访问日志表';

-- 验证表结构
SHOW COLUMNS FROM user_visit_logs;

-- 查看索引
SHOW INDEX FROM user_visit_logs;
