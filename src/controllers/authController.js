const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidEmail, isStrongPassword } = require('../utils/validators');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'sales_rep',
      organizationName,
      organizationId 
    } = req.body;

    // Validate email
    if (!isValidEmail(email)) {
      return errorResponse(res, 'INVALID_EMAIL', 'Invalid email format', 400);
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return errorResponse(
        res,
        'WEAK_PASSWORD',
        'Password must be at least 8 characters with 1 uppercase letter and 1 number',
        400
      );
    }

    // Validate role
    if (!['sales_rep', 'manager', 'admin'].includes(role)) {
      return errorResponse(res, 'INVALID_ROLE', 'Invalid role', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(
        res,
        'EMAIL_EXISTS',
        'Email already exists',
        400
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let finalOrganizationId = organizationId;

    // If creating new organization (manager/admin registering)
    if (organizationName && !organizationId) {
      // Check if organization name already exists
      const existingOrg = await prisma.organization.findFirst({
        where: { name: organizationName },
      });

      if (existingOrg) {
        return errorResponse(
          res,
          'ORGANIZATION_EXISTS',
          'Organization name already exists',
          400
        );
      }

      // Create new organization
      const organization = await prisma.organization.create({
        data: {
          name: organizationName,
        },
      });

      finalOrganizationId = organization.id;
    }

    // If joining existing organization, verify it exists
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        return errorResponse(
          res,
          'ORGANIZATION_NOT_FOUND',
          'Organization not found',
          400
        );
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        organizationId: finalOrganizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    // Create default goals for user
    await prisma.goals.create({
      data: {
        userId: user.id,
        organizationId: finalOrganizationId,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return successResponse(
      res,
      {
        token,
        user,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(
        res,
        'INVALID_CREDENTIALS',
        'Invalid credentials',
        401
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(
        res,
        'INVALID_CREDENTIALS',
        'Invalid credentials',
        401
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, {
      token,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role,
        organizationId: userWithoutPassword.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};

