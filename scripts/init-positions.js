require('dotenv').config();
const sequelize = require('../src/config/database');

async function initPositions() {
  try {
    // 创建表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`positions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '位置ID',
        \`code\` VARCHAR(20) NOT NULL UNIQUE COMMENT '位置编码',
        \`name\` VARCHAR(50) NOT NULL COMMENT '位置名称(中文)',
        \`name_en\` VARCHAR(50) COMMENT '位置名称(英文)',
        \`category\` ENUM('GK', 'DF', 'MF', 'FW') NOT NULL COMMENT '位置大类',
        \`sort_order\` INT DEFAULT 0 COMMENT '排序顺序',
        \`is_active\` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
        \`description\` VARCHAR(255) COMMENT '位置描述',
        INDEX \`idx_code\` (\`code\`),
        INDEX \`idx_category\` (\`category\`),
        INDEX \`idx_is_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='位置字典表';
    `);

    console.log('✅ 位置表创建成功');

    // 检查是否已有数据
    const [rows] = await sequelize.query('SELECT COUNT(*) as count FROM positions');
    if (rows[0].count > 0) {
      console.log('⚠️  位置表已有数据，跳过插入');
      process.exit(0);
    }

    // 插入初始数据
    const positions = [
      // 守门员
      { code: 'GK', name: '守门员', name_en: 'Goalkeeper', category: 'GK', sort_order: 1, description: '守门员' },

      // 后卫
      { code: 'CB', name: '中后卫', name_en: 'Center Back', category: 'DF', sort_order: 10, description: '中路防守核心' },
      { code: 'LCB', name: '左中卫', name_en: 'Left Center Back', category: 'DF', sort_order: 11, description: '左侧中后卫' },
      { code: 'RCB', name: '右中卫', name_en: 'Right Center Back', category: 'DF', sort_order: 12, description: '右侧中后卫' },
      { code: 'LB', name: '左后卫', name_en: 'Left Back', category: 'DF', sort_order: 13, description: '左路防守' },
      { code: 'RB', name: '右后卫', name_en: 'Right Back', category: 'DF', sort_order: 14, description: '右路防守' },
      { code: 'LWB', name: '左边后卫', name_en: 'Left Wing Back', category: 'DF', sort_order: 15, description: '左路攻守兼备' },
      { code: 'RWB', name: '右边后卫', name_en: 'Right Wing Back', category: 'DF', sort_order: 16, description: '右路攻守兼备' },
      { code: 'SW', name: '清道夫', name_en: 'Sweeper', category: 'DF', sort_order: 17, description: '拖后中卫' },

      // 中场
      { code: 'CDM', name: '后腰', name_en: 'Defensive Midfielder', category: 'MF', sort_order: 20, description: '防守型中场' },
      { code: 'CM', name: '中前卫', name_en: 'Central Midfielder', category: 'MF', sort_order: 21, description: '中路组织' },
      { code: 'CAM', name: '前腰', name_en: 'Attacking Midfielder', category: 'MF', sort_order: 22, description: '进攻型中场' },
      { code: 'LM', name: '左前卫', name_en: 'Left Midfielder', category: 'MF', sort_order: 23, description: '左路中场' },
      { code: 'RM', name: '右前卫', name_en: 'Right Midfielder', category: 'MF', sort_order: 24, description: '右路中场' },
      { code: 'LW', name: '左边锋', name_en: 'Left Winger', category: 'MF', sort_order: 25, description: '左路进攻' },
      { code: 'RW', name: '右边锋', name_en: 'Right Winger', category: 'MF', sort_order: 26, description: '右路进攻' },

      // 前锋
      { code: 'CF', name: '中锋', name_en: 'Center Forward', category: 'FW', sort_order: 30, description: '中路进攻核心' },
      { code: 'ST', name: '前锋', name_en: 'Striker', category: 'FW', sort_order: 31, description: '射手' },
      { code: 'LF', name: '左前锋', name_en: 'Left Forward', category: 'FW', sort_order: 32, description: '左路前锋' },
      { code: 'RF', name: '右前锋', name_en: 'Right Forward', category: 'FW', sort_order: 33, description: '右路前锋' },
      { code: 'SS', name: '影锋', name_en: 'Second Striker', category: 'FW', sort_order: 34, description: '前场自由人' }
    ];

    for (const pos of positions) {
      await sequelize.query(`
        INSERT INTO positions (code, name, name_en, category, sort_order, description)
        VALUES (:code, :name, :name_en, :category, :sort_order, :description)
      `, {
        replacements: pos
      });
    }

    console.log(`✅ 成功插入 ${positions.length} 个位置数据`);
    console.log('🎉 位置字典表初始化完成！');

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

initPositions();
