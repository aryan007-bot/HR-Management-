const reportService = require('../services/reportService');
const { asyncHandler } = require('../utils/errors');

class ReportController {
  /**
   * Get analytics for reports
   * GET /api/reports/analytics
   */
  getAnalytics = asyncHandler(async (req, res) => {
    const data = await reportService.getAnalytics(req.user.companyId);

    res.json({
      success: true,
      data
    });
  });
}

module.exports = new ReportController();
