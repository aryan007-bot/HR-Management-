const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

/**
 * All routes require authentication
 */
router.use(verifyToken);
router.use(authorizeRole('SUPER_ADMIN', 'HR', 'ADMIN_HR'));

router.get('/analytics', reportController.getAnalytics);

module.exports = router;
