const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');
const jwtConfig = require('../config/jwt');
const prisma = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(
        res,
        'NO_TOKEN',
        'Access token is required',
        401
      );
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    if (!user) {
      return errorResponse(
        res,
        'USER_NOT_FOUND',
        'User no longer exists',
        401
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'INVALID_TOKEN', 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'TOKEN_EXPIRED', 'Token has expired', 401);
    }
    return errorResponse(
      res,
      'AUTH_ERROR',
      'Authentication failed',
      401
    );
  }
};

/**
 * Check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        'UNAUTHORIZED',
        'Authentication required',
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Insufficient permissions',
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};

