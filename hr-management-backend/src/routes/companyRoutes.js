const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { validate, companyCreationSchema } = require('../validations/schemas');

/**
 * All routes require authentication
 */
router.use(verifyToken);

/**
 * Super Admin only routes
 */
router.post(
  '/',
  authorizeRole('SUPER_ADMIN'),
  validate(companyCreationSchema),
  companyController.createCompany
);

router.get(
  '/',
  authorizeRole('SUPER_ADMIN'),
  companyController.getCompanies
);

router.get(
  '/:id',
  authorizeRole('SUPER_ADMIN', 'ADMIN_HR'),
  companyController.getCompanyById
);

router.put(
  '/:id',
  authorizeRole('SUPER_ADMIN'),
  companyController.updateCompany
);

router.delete(
  '/:id',
  authorizeRole('SUPER_ADMIN'),
  companyController.deleteCompany
);

router.get(
  '/:id/stats',
  authorizeRole('SUPER_ADMIN', 'ADMIN_HR'),
  companyController.getCompanyStats
);

module.exports = router;
