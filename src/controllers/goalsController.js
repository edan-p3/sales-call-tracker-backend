const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { areValidMetrics } = require('../utils/validators');

/**
 * Get user's goals
 * GET /api/goals
 * Reps get organization-wide goals set by their manager
 * Managers/Admins can have personal goals or set organization goals
 */
const getGoals = async (req, res, next) => {
  try {
    let goals = null;

    // For regular sales reps: ONLY use organization-wide goals
    if (req.user.role === 'sales_rep') {
      if (req.user.organizationId) {
        goals = await prisma.goals.findFirst({
          where: {
            organizationId: req.user.organizationId,
            userId: null, // Organization-wide goals
            isActive: true,
          },
        });
      }

      // If no organization goals exist, create default organization goals
      if (!goals && req.user.organizationId) {
        goals = await prisma.goals.create({
          data: {
            organizationId: req.user.organizationId,
            userId: null, // Organization-wide, not user-specific
          },
        });
      }

      // If still no goals (no organization), return defaults
      if (!goals) {
        const defaultGoalsData = {
          callsPerDay: 25,
          emailsPerDay: 30,
          contactsPerDay: 10,
          responsesPerDay: 5,
          meetingsPerDay: 2,
          callsPerWeek: 125,
          emailsPerWeek: 150,
          contactsPerWeek: 50,
          responsesPerWeek: 25,
          meetingsPerWeek: 10,
        };
        return successResponse(res, defaultGoalsData);
      }
    } 
    // For managers/admins: Check organization goals first, then personal goals
    else {
      // First, try to find organization-wide goals
      if (req.user.organizationId) {
        goals = await prisma.goals.findFirst({
          where: {
            organizationId: req.user.organizationId,
            userId: null,
            isActive: true,
          },
        });
      }

      // If no organization goals, try personal goals
      if (!goals) {
        goals = await prisma.goals.findFirst({
          where: {
            userId: req.user.id,
            isActive: true,
          },
        });
      }

      // If still no goals, create organization-wide goals for the manager
      if (!goals && req.user.organizationId) {
        goals = await prisma.goals.create({
          data: {
            organizationId: req.user.organizationId,
            userId: null, // Organization-wide
          },
        });
      }

      // Last resort: create personal goals
      if (!goals) {
        goals = await prisma.goals.create({
          data: {
            userId: req.user.id,
          },
        });
      }
    }

    // Return only the goals data, not metadata
    const goalsData = {
      callsPerDay: goals.callsPerDay,
      emailsPerDay: goals.emailsPerDay,
      contactsPerDay: goals.contactsPerDay,
      responsesPerDay: goals.responsesPerDay,
      meetingsPerDay: 2, // Default for meetings (not in DB yet)
      callsPerWeek: goals.callsPerWeek,
      emailsPerWeek: goals.emailsPerWeek,
      contactsPerWeek: goals.contactsPerWeek,
      responsesPerWeek: goals.responsesPerWeek,
      meetingsPerWeek: 10, // Default for meetings (not in DB yet)
    };

    return successResponse(res, goalsData);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user's goals
 * PUT /api/goals
 * Managers save organization-wide goals, reps cannot save goals
 */
const updateGoals = async (req, res, next) => {
  try {
    const {
      callsPerDay,
      emailsPerDay,
      contactsPerDay,
      responsesPerDay,
      callsPerWeek,
      emailsPerWeek,
      contactsPerWeek,
      responsesPerWeek,
    } = req.body;

    // Only managers can update goals
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return errorResponse(
        res,
        'UNAUTHORIZED',
        'Only managers can update goals',
        403
      );
    }

    // Validate all metrics are non-negative
    if (!areValidMetrics(req.body)) {
      return errorResponse(
        res,
        'INVALID_METRICS',
        'All metric values must be non-negative',
        400
      );
    }

    // Managers save organization-wide goals (not personal goals)
    if (!req.user.organizationId) {
      return errorResponse(
        res,
        'NO_ORGANIZATION',
        'Manager must belong to an organization to set goals',
        400
      );
    }

    // Find existing organization-wide goals
    let goals = await prisma.goals.findFirst({
      where: {
        organizationId: req.user.organizationId,
        userId: null, // Organization-wide, not user-specific
        isActive: true,
      },
    });

    if (goals) {
      // Update existing organization goals
      goals = await prisma.goals.update({
        where: { id: goals.id },
        data: {
          callsPerDay,
          emailsPerDay,
          contactsPerDay,
          responsesPerDay,
          callsPerWeek,
          emailsPerWeek,
          contactsPerWeek,
          responsesPerWeek,
        },
      });
    } else {
      // Create new organization-wide goals
      goals = await prisma.goals.create({
        data: {
          organizationId: req.user.organizationId,
          userId: null, // Organization-wide
          callsPerDay,
          emailsPerDay,
          contactsPerDay,
          responsesPerDay,
          callsPerWeek,
          emailsPerWeek,
          contactsPerWeek,
          responsesPerWeek,
        },
      });
    }

    const goalsData = {
      callsPerDay: goals.callsPerDay,
      emailsPerDay: goals.emailsPerDay,
      contactsPerDay: goals.contactsPerDay,
      responsesPerDay: goals.responsesPerDay,
      callsPerWeek: goals.callsPerWeek,
      emailsPerWeek: goals.emailsPerWeek,
      contactsPerWeek: goals.contactsPerWeek,
      responsesPerWeek: goals.responsesPerWeek,
    };

    return successResponse(res, goalsData, 'Organization goals updated successfully. All team members will see these goals.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  updateGoals,
};

