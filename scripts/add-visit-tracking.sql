-- ============================================
-- 添加用户访问记录功能
-- 方案3：混合方案（users表 + 访问日志表）
-- ============================================

-- 1. 在 users 表添加访问统计字段（如果不存在）
-- 注意：如果字段已存在会报错，可以忽略
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname1 = 'last_visit_at';
SET @columnname2 = 'visit_count';
SET @preparedStatement1 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname1)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `last_visit_at` TIMESTAMP NULL COMMENT ''最后访问时间'' AFTER `updated_at`, ADD INDEX `idx_last_visit` (`last_visit_at`);')
));
PREPARE alterIfNotExists1 FROM @preparedStatement1;
EXECUTE alterIfNotExists1;
DEALLOCATE PREPARE alterIfNotExists1;

SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname2)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `visit_count` INT UNSIGNED DEFAULT 0 COMMENT ''累计访问次数'' AFTER `last_visit_at`;')
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- 2. 创建访问日志表
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

-- 3. 验证表结构
SHOW COLUMNS FROM users LIKE '%visit%';
SHOW COLUMNS FROM user_visit_logs;

-- 4. 查看索引
SHOW INDEX FROM user_visit_logs;
