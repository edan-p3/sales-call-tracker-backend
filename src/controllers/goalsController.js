const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { areValidMetrics } = require('../utils/validators');

/**
 * Get user's goals
 * GET /api/goals
 */
const getGoals = async (req, res, next) => {
  try {
    // Try to find user-specific goals first
    let goals = await prisma.goals.findFirst({
      where: {
        userId: req.user.id,
        isActive: true,
      },
    });

    // If no user-specific goals, try organization-wide goals
    if (!goals && req.user.organizationId) {
      goals = await prisma.goals.findFirst({
        where: {
          organizationId: req.user.organizationId,
          userId: null,
          isActive: true,
        },
      });
    }

    // If still no goals, create default goals for user
    if (!goals) {
      goals = await prisma.goals.create({
        data: {
          userId: req.user.id,
        },
      });
    }

    // Return only the goals data, not metadata
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

    return successResponse(res, goalsData);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user's goals
 * PUT /api/goals
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

    // Validate all metrics are non-negative
    if (!areValidMetrics(req.body)) {
      return errorResponse(
        res,
        'INVALID_METRICS',
        'All metric values must be non-negative',
        400
      );
    }

    // Find existing goals
    let goals = await prisma.goals.findFirst({
      where: {
        userId: req.user.id,
        isActive: true,
      },
    });

    if (goals) {
      // Update existing goals
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
      // Create new goals
      goals = await prisma.goals.create({
        data: {
          userId: req.user.id,
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

    return successResponse(res, goalsData, 'Goals updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  updateGoals,
};

