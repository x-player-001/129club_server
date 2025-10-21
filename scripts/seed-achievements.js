const sequelize = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function seedAchievements() {
  try {
    console.log('Seeding initial achievements...');

    const achievements = [
      {
        id: uuidv4(),
        code: 'hat_trick',
        name: 'Hat Trick',
        description: 'Score 3 goals in a single match',
        icon: '<©',
        type: 'single_match',
        condition: JSON.stringify({ field: 'goals', operator: '>=', value: 3 }),
        is_season_bound: true,
        is_repeatable: true,
        sort_order: 1,
        is_active: true
      },
      {
        id: uuidv4(),
        code: 'assist_king',
        name: 'Assist King',
        description: 'Make 3 assists in a single match',
        icon: '<¯',
        type: 'single_match',
        condition: JSON.stringify({ field: 'assists', operator: '>=', value: 3 }),
        is_season_bound: true,
        is_repeatable: true,
        sort_order: 2,
        is_active: true
      },
      {
        id: uuidv4(),
        code: 'perfect_attendance',
        name: 'Perfect Attendance',
        description: '100% attendance rate in the season',
        icon: '=Å',
        type: 'cumulative',
        condition: JSON.stringify({ field: 'attendance', operator: '>=', value: 100 }),
        is_season_bound: true,
        is_repeatable: false,
        sort_order: 3,
        is_active: true
      },
      {
        id: uuidv4(),
        code: 'mvp_collector',
        name: 'MVP Collector',
        description: 'Win MVP 5 times in the season',
        icon: 'P',
        type: 'cumulative',
        condition: JSON.stringify({ field: 'mvp_count', operator: '>=', value: 5 }),
        is_season_bound: true,
        is_repeatable: false,
        sort_order: 4,
        is_active: true
      },
      {
        id: uuidv4(),
        code: 'goal_machine',
        name: 'Goal Machine',
        description: 'Score 10 goals in the season',
        icon: '½',
        type: 'cumulative',
        condition: JSON.stringify({ field: 'goals', operator: '>=', value: 10 }),
        is_season_bound: true,
        is_repeatable: false,
        sort_order: 5,
        is_active: true
      },
      {
        id: uuidv4(),
        code: 'winning_streak',
        name: 'Winning Streak',
        description: 'Win 3 matches in a row',
        icon: '=%',
        type: 'streak',
        condition: JSON.stringify({ field: 'consecutive_wins', operator: '>=', value: 3 }),
        is_season_bound: true,
        is_repeatable: true,
        sort_order: 6,
        is_active: true
      }
    ];

    for (const achievement of achievements) {
      await sequelize.query(`
        INSERT INTO achievements (id, code, name, description, icon, type, \`condition\`,
                                  is_season_bound, is_repeatable, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          icon = VALUES(icon),
          type = VALUES(type),
          \`condition\` = VALUES(\`condition\`),
          is_season_bound = VALUES(is_season_bound),
          is_repeatable = VALUES(is_repeatable),
          sort_order = VALUES(sort_order),
          is_active = VALUES(is_active)
      `, {
        replacements: [
          achievement.id,
          achievement.code,
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.type,
          achievement.condition,
          achievement.is_season_bound,
          achievement.is_repeatable,
          achievement.sort_order,
          achievement.is_active
        ]
      });
      console.log(` Achievement seeded: ${achievement.name} (${achievement.code})`);
    }

    console.log('\n All achievements seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('× Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedAchievements();
