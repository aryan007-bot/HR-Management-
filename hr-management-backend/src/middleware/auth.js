const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { AppError } = require('../utils/errors');

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, jwtConfig.secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Authorize specific roles
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Ensure user belongs to the same company (for HR and ADMIN_HR)
 */
const checkCompanyAccess = (req, res, next) => {
  const { role, companyId } = req.user;

  // Super admin has access to all companies
  if (role === 'SUPER_ADMIN') {
    return next();
  }

  // For HR and ADMIN_HR, ensure they're accessing their own company data
  const targetCompanyId = req.params.companyId || req.body.company_id || req.query.company_id;

  if (targetCompanyId && targetCompanyId !== companyId) {
    return next(new AppError('Access denied to this company data', 403));
  }

  // Inject company_id for filtering
  req.companyId = companyId;
  next();
};

module.exports = {
  verifyToken,
  authorizeRole,
  checkCompanyAccess
};
