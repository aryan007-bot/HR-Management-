const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { validate, userRegistrationSchema } = require('../validations/schemas');

/**
 * Public routes
 */
router.post('/login', authController.login);

/**
 * Protected routes
 */
router.use(verifyToken);

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);

/**
 * Admin routes
 */
router.post(
  '/register',
  authorizeRole('SUPER_ADMIN', 'ADMIN_HR'),
  validate(userRegistrationSchema),
  authController.register
);

router.get(
  '/users',
  authorizeRole('SUPER_ADMIN', 'ADMIN_HR'),
  authController.getUsers
);

router.post(
  '/users/:userId/deactivate',
  authorizeRole('SUPER_ADMIN', 'ADMIN_HR'),
  authController.deactivateUser
);

router.post(
  '/users/:userId/activate',
  authorizeRole('SUPER_ADMIN', 'ADMIN_HR'),
  authController.activateUser
);

module.exports = router;
