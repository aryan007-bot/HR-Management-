const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { validate, visitorRegistrationSchema } = require('../validations/schemas');

/**
 * Public routes - No authentication required
 */
// Publicly accessible hosts endpoint
router.get('/public/hosts', visitorController.getHosts);

router.post(
  '/register',
  validate(visitorRegistrationSchema),
  visitorController.registerVisitor
);

/**
 * Protected routes - Require authentication
 */
router.use(verifyToken);
router.use(authorizeRole('SUPER_ADMIN', 'HR', 'ADMIN_HR'));

router.get('/', visitorController.getVisitors);
router.get('/stats', visitorController.getVisitorStats);
router.get('/today', visitorController.getTodaysVisitors);

router.get('/:id', visitorController.getVisitorById);

router.patch('/:id/status', visitorController.updateVisitorStatus);

router.delete('/:id', visitorController.deleteVisitor);

module.exports = router;
