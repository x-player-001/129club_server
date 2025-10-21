const Router = require('koa-router');
const positionController = require('../controllers/position.controller');

const router = new Router();

/**
 * GET /api/position/list - 获取位置列表
 * Query参数:
 *   - category: 位置类别 (GK/DF/MF/FW)
 *   - isActive: 是否启用 (默认true)
 */
router.get('/list', positionController.getPositionList);

/**
 * GET /api/position/grouped - 按类别分组获取位置
 */
router.get('/grouped', positionController.getPositionsByCategory);

module.exports = router;
