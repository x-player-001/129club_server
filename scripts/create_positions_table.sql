-- 创建位置字典表
CREATE TABLE IF NOT EXISTS `positions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '位置ID',
  `code` VARCHAR(20) NOT NULL UNIQUE COMMENT '位置编码',
  `name` VARCHAR(50) NOT NULL COMMENT '位置名称(中文)',
  `name_en` VARCHAR(50) COMMENT '位置名称(英文)',
  `category` ENUM('GK', 'DF', 'MF', 'FW') NOT NULL COMMENT '位置大类',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `description` VARCHAR(255) COMMENT '位置描述',
  INDEX `idx_code` (`code`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='位置字典表';

-- 插入初始位置数据
INSERT INTO `positions` (`code`, `name`, `name_en`, `category`, `sort_order`, `description`) VALUES
-- 守门员
('GK', '守门员', 'Goalkeeper', 'GK', 1, '守门员'),

-- 后卫
('CB', '中后卫', 'Center Back', 'DF', 10, '中路防守核心'),
('LCB', '左中卫', 'Left Center Back', 'DF', 11, '左侧中后卫'),
('RCB', '右中卫', 'Right Center Back', 'DF', 12, '右侧中后卫'),
('LB', '左后卫', 'Left Back', 'DF', 13, '左路防守'),
('RB', '右后卫', 'Right Back', 'DF', 14, '右路防守'),
('LWB', '左边后卫', 'Left Wing Back', 'DF', 15, '左路攻守兼备'),
('RWB', '右边后卫', 'Right Wing Back', 'DF', 16, '右路攻守兼备'),
('SW', '清道夫', 'Sweeper', 'DF', 17, '拖后中卫'),

-- 中场
('CDM', '后腰', 'Defensive Midfielder', 'MF', 20, '防守型中场'),
('CM', '中前卫', 'Central Midfielder', 'MF', 21, '中路组织'),
('CAM', '前腰', 'Attacking Midfielder', 'MF', 22, '进攻型中场'),
('LM', '左前卫', 'Left Midfielder', 'MF', 23, '左路中场'),
('RM', '右前卫', 'Right Midfielder', 'MF', 24, '右路中场'),
('LW', '左边锋', 'Left Winger', 'MF', 25, '左路进攻'),
('RW', '右边锋', 'Right Winger', 'MF', 26, '右路进攻'),

-- 前锋
('CF', '中锋', 'Center Forward', 'FW', 30, '中路进攻核心'),
('ST', '前锋', 'Striker', 'FW', 31, '射手'),
('LF', '左前锋', 'Left Forward', 'FW', 32, '左路前锋'),
('RF', '右前锋', 'Right Forward', 'FW', 33, '右路前锋'),
('SS', '影锋', 'Second Striker', 'FW', 34, '前场自由人');
