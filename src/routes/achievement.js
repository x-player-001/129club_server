const Router = require('koa-router');
const achievementController = require('../controllers/achievement.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router();

// Get all achievements
router.get('/list', authMiddleware, achievementController.getAllAchievements);

// Get user achievement progress
router.get('/my/progress', authMiddleware, achievementController.getUserProgress);

// Get user unlocked achievements
router.get('/my', authMiddleware, achievementController.getUserAchievements);

// Manually check achievements (admin)
router.post('/check/:userId', authMiddleware, achievementController.checkAchievements);

module.exports = router;
