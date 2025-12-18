-- 更新 share_configs 表为通用配置表（不关联 match_id）
-- 支持历史记录，通过 is_active 标识当前有效配置

-- 删除旧表
DROP TABLE IF EXISTS share_configs;

-- 创建新表
CREATE TABLE share_configs (
  id CHAR(36) PRIMARY KEY COMMENT '配置ID',
  title VARCHAR(100) NULL COMMENT '分享标题',
  image_url VARCHAR(255) NULL COMMENT '分享图片URL',
  description VARCHAR(255) NULL COMMENT '分享描述',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否有效',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享配置表';
