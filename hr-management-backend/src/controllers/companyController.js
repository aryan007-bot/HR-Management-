const companyService = require('../services/companyService');
const { asyncHandler } = require('../utils/errors');

class CompanyController {
  /**
   * Create company (Super Admin only)
   * POST /api/companies
   */
  createCompany = asyncHandler(async (req, res) => {
    const company = await companyService.createCompany(req.body);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  });

  /**
   * Get all companies
   * GET /api/companies
   */
  getCompanies = asyncHandler(async (req, res) => {
    const companies = await companyService.getCompanies();

    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  });

  /**
   * Get company by ID
   * GET /api/companies/:id
   */
  getCompanyById = asyncHandler(async (req, res) => {
    const company = await companyService.getCompanyById(req.params.id);

    res.json({
      success: true,
      data: company
    });
  });

  /**
   * Update company
   * PUT /api/companies/:id
   */
  updateCompany = asyncHandler(async (req, res) => {
    const company = await companyService.updateCompany(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  });

  /**
   * Delete company
   * DELETE /api/companies/:id
   */
  deleteCompany = asyncHandler(async (req, res) => {
    const result = await companyService.deleteCompany(req.params.id);

    res.json({
      success: true,
      message: result.message
    });
  });

  /**
   * Get company statistics
   * GET /api/companies/:id/stats
   */
  getCompanyStats = asyncHandler(async (req, res) => {
    const stats = await companyService.getCompanyStats(req.params.id);

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new CompanyController();
