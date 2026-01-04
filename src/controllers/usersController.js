const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isMonday, isValidDateFormat } = require('../utils/dateHelpers');

/**
 * Transform activity to response format
 */
const transformActivityToResponse = (activity) => {
  if (!activity) return null;

  return {
    weekStartDate: activity.weekStartDate,
    monday: {
      calls: activity.mondayCalls,
      emails: activity.mondayEmails,
      contacts: activity.mondayContacts,
      responses: activity.mondayResponses,
    },
    tuesday: {
      calls: activity.tuesdayCalls,
      emails: activity.tuesdayEmails,
      contacts: activity.tuesdayContacts,
      responses: activity.tuesdayResponses,
    },
    wednesday: {
      calls: activity.wednesdayCalls,
      emails: activity.wednesdayEmails,
      contacts: activity.wednesdayContacts,
      responses: activity.wednesdayResponses,
    },
    thursday: {
      calls: activity.thursdayCalls,
      emails: activity.thursdayEmails,
      contacts: activity.thursdayContacts,
      responses: activity.thursdayResponses,
    },
    friday: {
      calls: activity.fridayCalls,
      emails: activity.fridayEmails,
      contacts: activity.fridayContacts,
      responses: activity.fridayResponses,
    },
  };
};

/**
 * Get all users in organization
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const where = {};

    // If user has organizationId, only show users from same org
    if (req.user.organizationId) {
      where.organizationId = req.user.organizationId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(res, users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific user's activity for a week
 * GET /api/users/:userId/activity/week/:weekStartDate
 */
const getUserWeekActivity = async (req, res, next) => {
  try {
    const { userId, weekStartDate } = req.params;

    // Validate date format
    if (!isValidDateFormat(weekStartDate)) {
      return errorResponse(
        res,
        'INVALID_DATE',
        'Invalid date format. Use YYYY-MM-DD',
        400
      );
    }

    // Validate it's a Monday
    if (!isMonday(weekStartDate)) {
      return errorResponse(
        res,
        'NOT_MONDAY',
        'Week start date must be a Monday',
        400
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // If current user has organizationId, verify target user is in same org
    if (req.user.organizationId && targetUser.organizationId !== req.user.organizationId) {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Cannot access users from other organizations',
        403
      );
    }

    const activity = await prisma.weeklyActivity.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate,
        },
      },
    });

    if (!activity) {
      return successResponse(
        res,
        null,
        'No activity found for this week'
      );
    }

    const responseData = transformActivityToResponse(activity);
    return successResponse(res, responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all activities for a specific user
 * GET /api/users/:userId/activity/all
 */
const getUserAllActivities = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // If current user has organizationId, verify target user is in same org
    if (req.user.organizationId && targetUser.organizationId !== req.user.organizationId) {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Cannot access users from other organizations',
        403
      );
    }

    // Build where clause
    const where = {
      userId,
    };

    // Add date filters if provided
    if (startDate || endDate) {
      where.weekStartDate = {};
      if (startDate) {
        where.weekStartDate.gte = startDate;
      }
      if (endDate) {
        where.weekStartDate.lte = endDate;
      }
    }

    const activities = await prisma.weeklyActivity.findMany({
      where,
      orderBy: {
        weekStartDate: 'desc',
      },
    });

    const responseData = activities.map(transformActivityToResponse);
    return successResponse(res, responseData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserWeekActivity,
  getUserAllActivities,
};

