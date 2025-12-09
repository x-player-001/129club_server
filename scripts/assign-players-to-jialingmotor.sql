-- 将指定球员分配到新赛季的嘉陵摩托队
-- 新赛季嘉陵摩托队ID: 71c88b57-9492-473f-ac5d-4930f27bf621

-- 1. 更新球员的当前队伍
UPDATE users SET current_team_id = '71c88b57-9492-473f-ac5d-4930f27bf621'
WHERE id IN (
  '09f94250-a533-490b-bea7-295e2b128737', -- 铜元素
  '21a35430-9b03-4adf-9ac1-be66f1aad476', -- 施毅
  '37a97715-d228-479b-a032-e04e24b43ae7', -- 罗阳
  '407b88e4-d9cf-4c78-bff5-85e4fa868eca', -- 杨涛
  '41097aab-54bd-4800-84cf-f79e8f7d3d2b', -- 邱帅
  '41c2f924-fcc1-4c6f-9b86-7a715bd54d72', -- 球霸
  '7ac814ea-1d64-4878-a68e-cbba2cf028e8', -- 朱静
  '7dda9b5f-62ca-4e98-a44d-943cb982c684', -- 杨鹏
  '7fbeef0d-dd93-457b-a259-16e869430e28', -- 曹枫
  '84e2f056-3854-41e6-9941-25f9a428fcda', -- 黄波
  '8cf5f4ad-3159-41e2-942f-b77804afe972', -- 廖尚超
  '942b0614-06e4-4e35-acd8-52f806a9a5c7', -- 刘立希
  '9bb0beb2-1810-466e-9e60-713a82f2c6df', -- 曾鹏
  'b529cd51-6539-4b6a-9689-22623e79bb43', -- 张家瑞
  'c1f39848-d2e1-40e1-bbb7-95ff3d81e86c', -- 卿明川
  'cef30ce9-504f-48fe-9bee-b6c66b61db77', -- 覃文波
  'e604887d-c19b-403f-a659-972d1ed580fb', -- 柳真
  'f60affc5-8091-4f3d-af5a-5132a8e97bc0', -- 黄纯
  'f6f0089f-906c-440f-ac5c-68b479e13133', -- 李云鹏
  'fe6aebef-6f31-4cc1-baa0-4131c267d5f8'  -- 黄展
);

-- 2. 在 team_members 表中添加成员记录
INSERT INTO team_members (id, team_id, user_id, role, is_active, joined_at)
VALUES
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '09f94250-a533-490b-bea7-295e2b128737', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '21a35430-9b03-4adf-9ac1-be66f1aad476', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '37a97715-d228-479b-a032-e04e24b43ae7', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '407b88e4-d9cf-4c78-bff5-85e4fa868eca', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '41097aab-54bd-4800-84cf-f79e8f7d3d2b', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '41c2f924-fcc1-4c6f-9b86-7a715bd54d72', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '7ac814ea-1d64-4878-a68e-cbba2cf028e8', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '7dda9b5f-62ca-4e98-a44d-943cb982c684', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '7fbeef0d-dd93-457b-a259-16e869430e28', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '84e2f056-3854-41e6-9941-25f9a428fcda', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '8cf5f4ad-3159-41e2-942f-b77804afe972', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '942b0614-06e4-4e35-acd8-52f806a9a5c7', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', '9bb0beb2-1810-466e-9e60-713a82f2c6df', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'b529cd51-6539-4b6a-9689-22623e79bb43', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'c1f39848-d2e1-40e1-bbb7-95ff3d81e86c', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'cef30ce9-504f-48fe-9bee-b6c66b61db77', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'e604887d-c19b-403f-a659-972d1ed580fb', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'f60affc5-8091-4f3d-af5a-5132a8e97bc0', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'f6f0089f-906c-440f-ac5c-68b479e13133', 'member', 1, NOW()),
  (UUID(), '71c88b57-9492-473f-ac5d-4930f27bf621', 'fe6aebef-6f31-4cc1-baa0-4131c267d5f8', 'member', 1, NOW());

-- 查询结果确认
SELECT u.real_name, u.nickname, t.name as team_name
FROM users u
LEFT JOIN teams t ON u.current_team_id = t.id
WHERE u.id IN (
  '09f94250-a533-490b-bea7-295e2b128737', '21a35430-9b03-4adf-9ac1-be66f1aad476',
  '37a97715-d228-479b-a032-e04e24b43ae7', '407b88e4-d9cf-4c78-bff5-85e4fa868eca',
  '41097aab-54bd-4800-84cf-f79e8f7d3d2b', '41c2f924-fcc1-4c6f-9b86-7a715bd54d72',
  '7ac814ea-1d64-4878-a68e-cbba2cf028e8', '7dda9b5f-62ca-4e98-a44d-943cb982c684',
  '7fbeef0d-dd93-457b-a259-16e869430e28', '84e2f056-3854-41e6-9941-25f9a428fcda',
  '8cf5f4ad-3159-41e2-942f-b77804afe972', '942b0614-06e4-4e35-acd8-52f806a9a5c7',
  '9bb0beb2-1810-466e-9e60-713a82f2c6df', 'b529cd51-6539-4b6a-9689-22623e79bb43',
  'c1f39848-d2e1-40e1-bbb7-95ff3d81e86c', 'cef30ce9-504f-48fe-9bee-b6c66b61db77',
  'e604887d-c19b-403f-a659-972d1ed580fb', 'f60affc5-8091-4f3d-af5a-5132a8e97bc0',
  'f6f0089f-906c-440f-ac5c-68b479e13133', 'fe6aebef-6f31-4cc1-baa0-4131c267d5f8'
);
