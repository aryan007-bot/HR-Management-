const authService = require('../services/authService');
const { asyncHandler } = require('../utils/errors');

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const userData = { ...req.body };
    
    // If not super admin, force the new user's company_id to the current user's company_id
    if (req.user.role !== 'SUPER_ADMIN') {
      userData.company_id = req.user.companyId;
    }
    
    const user = await authService.register(userData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const profile = await authService.getProfile(req.user.id);

    res.json({
      success: true,
      data: profile
    });
  });

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const updated = await authService.updateProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  });

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: result.message
    });
  });

  /**
   * Get all users (Admin only)
   * GET /api/auth/users
   */
  getUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const companyId = req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    
    const users = await authService.getUsers(companyId, role);

    res.json({
      success: true,
      data: users
    });
  });

  /**
   * Deactivate user
   * POST /api/auth/users/:userId/deactivate
   */
  deactivateUser = asyncHandler(async (req, res) => {
    const user = await authService.deactivateUser(req.params.userId);

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  });

  /**
   * Activate user
   * POST /api/auth/users/:userId/activate
   */
  activateUser = asyncHandler(async (req, res) => {
    const user = await authService.activateUser(req.params.userId);

    res.json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  });
}

module.exports = new AuthController();
