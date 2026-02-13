const visitorService = require('../services/visitorService');
const { asyncHandler } = require('../utils/errors');

class VisitorController {
  /**
   * Register new visitor
   * POST /api/visitors/register
   */
  registerVisitor = asyncHandler(async (req, res) => {
    console.log('Registering visitor with body:', req.body);
    // For public registration, we don't have req.user
    // Use req.body.hr_id if provided (for visitor registration selecting HR)
    const userId = req.user ? req.user.id : (req.body.hr_id || null);
    const companyId = req.user ? req.user.companyId : (req.body.company_id || 'b9134d23-129e-43da-b92b-effc47c945a0'); // Default to ONS Solution

    const result = await visitorService.registerVisitor(
      req.body,
      userId,
      companyId
    );

    if (!result.allow) {
      return res.status(409).json({
        success: false,
        allow: false,
        reason: result.reason,
        message: result.message,
        employee_id: result.employee_id,
        employee_name: result.employee_name
      });
    }

    res.status(201).json({
      success: true,
      allow: true,
      candidate_type: result.candidate_type,
      visitor_id: result.visitor_id,
      data: result.visitor
    });
  });

  /**
   * Get all visitors
   * GET /api/visitors
   */
  getVisitors = asyncHandler(async (req, res) => {
    const { status, candidate_type, hr_id } = req.query;
    
    // Strict visibility: HRs can only see their own visitors
    let filterHrId = hr_id;
    if (req.user.role === 'HR') {
      filterHrId = req.user.id;
    }

    const visitors = await visitorService.getVisitors(req.user.companyId, {
      status,
      candidate_type,
      hr_id: filterHrId
    });

    res.json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  });

  /**
   * Get visitor by ID
   * GET /api/visitors/:id
   */
  getVisitorById = asyncHandler(async (req, res) => {
    const visitor = await visitorService.getVisitorById(
      req.params.id,
      req.user.companyId
    );

    res.json({
      success: true,
      data: visitor
    });
  });

  /**
   * Update visitor status
   * PATCH /api/visitors/:id/status
   */
  updateVisitorStatus = asyncHandler(async (req, res) => {
    const { status, remarks } = req.body;
    const visitor = await visitorService.updateVisitorStatus(
      req.params.id,
      status,
      req.user.companyId,
      remarks
    );

    res.json({
      success: true,
      message: 'Visitor status updated successfully',
      data: visitor
    });
  });

  /**
   * Delete visitor
   * DELETE /api/visitors/:id
   */
  deleteVisitor = asyncHandler(async (req, res) => {
    const result = await visitorService.deleteVisitor(
      req.params.id,
      req.user.companyId
    );

    res.json({
      success: true,
      message: result.message
    });
  });

  /**
   * Get potential hosts (HRs)
   */
  getHosts = asyncHandler(async (req, res) => {
    // defaults to ONS Solution
    let companyId = 'b9134d23-129e-43da-b92b-effc47c945a0'; 
    
    if (req.user) {
      companyId = req.user.companyId;
    } else if (req.query.company_id) {
      companyId = req.query.company_id;
    }

    const hosts = await visitorService.getHosts(companyId);
    console.log(`getHosts for company ${companyId}: Found ${hosts.length} hosts`);

    res.json({
      success: true,
      data: hosts
    });
  });

  /**
   * Get visitor statistics for dashboard
   */
  getVisitorStats = asyncHandler(async (req, res) => {
    const stats = await visitorService.getVisitorStats(req.user.companyId);

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get today's visitors for dashboard
   */
  getTodaysVisitors = asyncHandler(async (req, res) => {
    const visitors = await visitorService.getTodaysVisitors(req.user.companyId);

    res.json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  });
}

module.exports = new VisitorController();
