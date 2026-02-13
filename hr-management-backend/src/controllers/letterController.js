const letterService = require('../services/letterService');
const { asyncHandler } = require('../utils/errors');

class LetterController {
  /**
   * Create letter template
   * POST /api/templates
   */
  createTemplate = asyncHandler(async (req, res) => {
    const template = await letterService.createTemplate(
      req.body,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  });

  /**
   * Get all templates
   * GET /api/templates
   */
  getTemplates = asyncHandler(async (req, res) => {
    const { type, is_active } = req.query;
    const templates = await letterService.getTemplates(req.user.companyId, {
      type,
      is_active: is_active === 'true'
    });

    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  });

  /**
   * Get template by ID
   * GET /api/templates/:id
   */
  getTemplateById = asyncHandler(async (req, res) => {
    const template = await letterService.getTemplateById(
      req.params.id,
      req.user.companyId
    );

    res.json({
      success: true,
      data: template
    });
  });

  /**
   * Update template
   * PUT /api/templates/:id
   */
  updateTemplate = asyncHandler(async (req, res) => {
    const template = await letterService.updateTemplate(
      req.params.id,
      req.body,
      req.user.companyId
    );

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  });

  /**
   * Delete template
   * DELETE /api/templates/:id
   */
  deleteTemplate = asyncHandler(async (req, res) => {
    const result = await letterService.deleteTemplate(
      req.params.id,
      req.user.companyId
    );

    res.json({
      success: true,
      message: result.message
    });
  });

  /**
   * Generate letter
   * POST /api/employees/:employeeId/generate-letter
   */
  generateLetter = asyncHandler(async (req, res) => {
    const { template_id, additional_data } = req.body;
    
    const letter = await letterService.generateLetter(
      req.params.employeeId,
      template_id,
      req.user.companyId,
      req.user.id,
      additional_data
    );

    res.status(201).json({
      success: true,
      message: 'Letter generated successfully',
      data: letter
    });
  });

  /**
   * Get employee letters
   * GET /api/employees/:employeeId/letters
   */
  getEmployeeLetters = asyncHandler(async (req, res) => {
    const letters = await letterService.getEmployeeLetters(
      req.params.employeeId,
      req.user.companyId
    );

    res.json({
      success: true,
      count: letters.length,
      data: letters
    });
  });
}

module.exports = new LetterController();
