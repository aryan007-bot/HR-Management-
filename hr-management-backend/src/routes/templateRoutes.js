const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letterController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { validate, letterTemplateSchema } = require('../validations/schemas');

/**
 * All routes require authentication
 */
router.use(verifyToken);
router.use(authorizeRole('SUPER_ADMIN', 'ADMIN_HR'));

/**
 * Template routes
 */
router.post(
  '/',
  validate(letterTemplateSchema),
  letterController.createTemplate
);

router.get('/', letterController.getTemplates);

router.get('/:id', letterController.getTemplateById);

router.put('/:id', letterController.updateTemplate);

router.delete('/:id', letterController.deleteTemplate);

module.exports = router;
