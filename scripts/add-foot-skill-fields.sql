-- 添加擅长脚字段到users表
-- 左右脚分别用 0-5 的数字表示擅长程度

ALTER TABLE `users`
ADD COLUMN `left_foot_skill` TINYINT UNSIGNED DEFAULT 0 COMMENT '左脚擅长程度(0-5, 0=不会, 5=非常擅长)' AFTER `position`,
ADD COLUMN `right_foot_skill` TINYINT UNSIGNED DEFAULT 0 COMMENT '右脚擅长程度(0-5, 0=不会, 5=非常擅长)' AFTER `left_foot_skill`;

-- 验证字段是否添加成功
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN ('left_foot_skill', 'right_foot_skill');
