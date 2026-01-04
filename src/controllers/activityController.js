const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isMonday, isValidDateFormat } = require('../utils/dateHelpers');

/**
 * Transform database record to API response format
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
 * Get activity for a specific week
 * GET /api/activity/week/:weekStartDate
 */
const getWeekActivity = async (req, res, next) => {
  try {
    const { weekStartDate } = req.params;

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

    const activity = await prisma.weeklyActivity.findUnique({
      where: {
        userId_weekStartDate: {
          userId: req.user.id,
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
 * Create or update weekly activity (upsert)
 * POST /api/activity/week
 */
const saveWeekActivity = async (req, res, next) => {
  try {
    const { weekStartDate, monday, tuesday, wednesday, thursday, friday } = req.body;

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

    // Prepare data for upsert
    const activityData = {
      userId: req.user.id,
      weekStartDate,
      mondayCalls: monday?.calls ?? 0,
      mondayEmails: monday?.emails ?? 0,
      mondayContacts: monday?.contacts ?? 0,
      mondayResponses: monday?.responses ?? 0,
      tuesdayCalls: tuesday?.calls ?? 0,
      tuesdayEmails: tuesday?.emails ?? 0,
      tuesdayContacts: tuesday?.contacts ?? 0,
      tuesdayResponses: tuesday?.responses ?? 0,
      wednesdayCalls: wednesday?.calls ?? 0,
      wednesdayEmails: wednesday?.emails ?? 0,
      wednesdayContacts: wednesday?.contacts ?? 0,
      wednesdayResponses: wednesday?.responses ?? 0,
      thursdayCalls: thursday?.calls ?? 0,
      thursdayEmails: thursday?.emails ?? 0,
      thursdayContacts: thursday?.contacts ?? 0,
      thursdayResponses: thursday?.responses ?? 0,
      fridayCalls: friday?.calls ?? 0,
      fridayEmails: friday?.emails ?? 0,
      fridayContacts: friday?.contacts ?? 0,
      fridayResponses: friday?.responses ?? 0,
    };

    // Validate all numbers are non-negative
    for (const key in activityData) {
      if (typeof activityData[key] === 'number' && activityData[key] < 0) {
        return errorResponse(
          res,
          'INVALID_VALUE',
          'All activity values must be non-negative',
          400
        );
      }
    }

    // Upsert activity
    const activity = await prisma.weeklyActivity.upsert({
      where: {
        userId_weekStartDate: {
          userId: req.user.id,
          weekStartDate,
        },
      },
      update: activityData,
      create: activityData,
    });

    const responseData = transformActivityToResponse(activity);
    return successResponse(
      res,
      responseData,
      'Weekly activity saved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all weekly activities for current user
 * GET /api/activity/all
 */
const getAllActivities = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build where clause
    const where = {
      userId: req.user.id,
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
  getWeekActivity,
  saveWeekActivity,
  getAllActivities,
};

