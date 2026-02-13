const employeeService = require('../services/employeeService');
const { asyncHandler } = require('../utils/errors');

class EmployeeController {
  /**
   * Convert visitor to employee
   * POST /api/employees/convert/:visitorId
   */
  convertVisitor = asyncHandler(async (req, res) => {
    const employee = await employeeService.convertVisitorToEmployee(
      req.params.visitorId,
      req.user.companyId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Visitor converted to employee successfully',
      data: employee
    });
  });

  /**
   * Create employee directly
   * POST /api/employees
   */
  createEmployee = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.body.company_id || 'b9134d23-129e-43da-b92b-effc47c945a0';
    const employee = await employeeService.createEmployee(
      req.body,
      companyId
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  });

  /**
   * Get all employees
   * GET /api/employees
   */
  getEmployees = asyncHandler(async (req, res) => {
    const { status, department } = req.query;
    console.log(`Getting employees for company: ${req.user.companyId}, filters:`, { status, department });
    const employees = await employeeService.getEmployees(req.user.companyId, {
      status,
      department
    });
    console.log(`Found ${employees.length} employees`);

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  });

  /**
   * Get employee by ID
   * GET /api/employees/:id
   */
  getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await employeeService.getEmployeeById(
      req.params.id,
      req.user.companyId
    );

    res.json({
      success: true,
      data: employee
    });
  });

  /**
   * Update employee
   * PUT /api/employees/:id
   */
  updateEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.user.companyId
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  });

  /**
   * Offboard employee
   * POST /api/employees/:id/offboard
   */
  offboardEmployee = asyncHandler(async (req, res) => {
    const { date_of_leaving } = req.body;
    const employee = await employeeService.offboardEmployee(
      req.params.id,
      req.user.companyId,
      date_of_leaving
    );

    res.json({
      success: true,
      message: 'Employee offboarded successfully',
      data: employee
    });
  });

  /**
   * Get employee statistics
   * GET /api/employees/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await employeeService.getEmployeeStats(req.user.companyId);

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Delete employee
   * DELETE /api/employees/:id
   */
  deleteEmployee = asyncHandler(async (req, res) => {
    await employeeService.deleteEmployee(
      req.params.id,
      req.user.companyId
    );

    res.json({
      success: true,
      message: 'Employee deleted successfully from the system'
    });
  });
}

module.exports = new EmployeeController();
