const sequelize = require('../src/config/database');

async function createAchievementTables() {
  try {
    console.log('Creating achievement system tables...');

    // Create achievements table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(200),
        type ENUM('single_match', 'cumulative', 'streak') NOT NULL DEFAULT 'single_match',
        \`condition\` JSON,
        is_season_bound BOOLEAN DEFAULT FALSE,
        is_repeatable BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(' achievements table created');

    // Create user_achievements table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        achievement_id VARCHAR(36) NOT NULL,
        season_id VARCHAR(36),
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        match_id VARCHAR(36),
        unlock_count INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_achievement_id (achievement_id),
        UNIQUE KEY unique_user_achievement_season (user_id, achievement_id, season_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(' user_achievements table created');

    // Create notifications table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type ENUM('achievement', 'match', 'system') NOT NULL DEFAULT 'system',
        title VARCHAR(200) NOT NULL,
        content TEXT,
        data JSON,
        is_read BOOLEAN DEFAULT FALSE,
        is_shown BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_user_shown (user_id, is_shown),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(' notifications table created');

    console.log('\n All achievement system tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('� Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAchievementTables();
