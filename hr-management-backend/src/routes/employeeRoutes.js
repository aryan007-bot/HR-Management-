const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const documentController = require('../controllers/documentController');
const letterController = require('../controllers/letterController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { validate, employeeCreationSchema } = require('../validations/schemas');

/**
 * All routes require authentication
 */
router.use(verifyToken);
router.use(authorizeRole('SUPER_ADMIN', 'HR', 'ADMIN_HR'));

/**
 * Employee routes
 */
router.post(
  '/convert/:visitorId',
  employeeController.convertVisitor
);

router.post(
  '/',
  validate(employeeCreationSchema),
  employeeController.createEmployee
);

router.get('/', employeeController.getEmployees);

// Specific routes must come before parameterized routes
router.get('/stats', employeeController.getStats);

// Parameterized routes
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.post('/:id/offboard', employeeController.offboardEmployee);

/**
 * Document routes
 */
router.post(
  '/:employeeId/documents',
  documentController.uploadDocument
);

router.get(
  '/:employeeId/documents',
  documentController.getEmployeeDocuments
);

router.get(
  '/:employeeId/documents/:documentId',
  documentController.getDocumentById
);

router.delete(
  '/:employeeId/documents/:documentId',
  documentController.deleteDocument
);

/**
 * Letter generation routes
 */
router.post(
  '/:employeeId/generate-letter',
  letterController.generateLetter
);

router.get(
  '/:employeeId/letters',
  letterController.getEmployeeLetters
);

module.exports = router;
