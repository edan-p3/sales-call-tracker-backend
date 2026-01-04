const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get all team members for a manager
 * GET /api/team/members
 */
const getTeamMembers = async (req, res, next) => {
  try {
    const { organizationId, role } = req.user;

    // Only managers and admins can view team
    if (role !== 'manager' && role !== 'admin') {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Only managers can view team members',
        403
      );
    }

    if (!organizationId) {
      return errorResponse(
        res,
        'NO_ORGANIZATION',
        'User is not part of an organization',
        400
      );
    }

    // Get all users in the same organization (excluding self)
    const teamMembers = await prisma.user.findMany({
      where: {
        organizationId,
        id: { not: req.user.id },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return successResponse(res, teamMembers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific team member's goals
 * GET /api/team/member/:userId/goals
 */
const getTeamMemberGoals = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { organizationId, role } = req.user;

    // Only managers and admins can view team data
    if (role !== 'manager' && role !== 'admin') {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Only managers can view team data',
        403
      );
    }

    // Verify the target user is in the same organization
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!targetUser) {
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    if (targetUser.organizationId !== organizationId) {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Cannot view data from another organization',
        403
      );
    }

    // Get user's goals
    const goals = await prisma.goals.findFirst({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        callsPerDay: true,
        emailsPerDay: true,
        contactsPerDay: true,
        responsesPerDay: true,
        callsPerWeek: true,
        emailsPerWeek: true,
        contactsPerWeek: true,
        responsesPerWeek: true,
      },
    });

    if (!goals) {
      // Return default goals if none exist
      return successResponse(res, {
        callsPerDay: 25,
        emailsPerDay: 30,
        contactsPerDay: 10,
        responsesPerDay: 5,
        callsPerWeek: 125,
        emailsPerWeek: 150,
        contactsPerWeek: 50,
        responsesPerWeek: 25,
      });
    }

    return successResponse(res, goals);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific team member's weekly activity
 * GET /api/team/member/:userId/activity/:weekStart
 */
const getTeamMemberActivity = async (req, res, next) => {
  try {
    const { userId, weekStart } = req.params;
    const { organizationId, role } = req.user;

    // Only managers and admins can view team data
    if (role !== 'manager' && role !== 'admin') {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Only managers can view team data',
        403
      );
    }

    // Verify the target user is in the same organization
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!targetUser) {
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    if (targetUser.organizationId !== organizationId) {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Cannot view data from another organization',
        403
      );
    }

    // Get weekly activity
    const activity = await prisma.weeklyActivity.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: weekStart,
        },
      },
    });

    if (!activity) {
      return successResponse(res, null, 'No data found for this week');
    }

    // Transform to frontend format
    const formattedActivity = {
      id: activity.id,
      userId: activity.userId,
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

    return successResponse(res, formattedActivity);
  } catch (error) {
    next(error);
  }
};

/**
 * Update specific team member's weekly activity (managers can edit)
 * POST /api/team/member/:userId/activity
 */
const updateTeamMemberActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { weekStartDate, monday, tuesday, wednesday, thursday, friday } = req.body;
    const { organizationId, role } = req.user;

    // Only managers and admins can edit team data
    if (role !== 'manager' && role !== 'admin') {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Only managers can edit team data',
        403
      );
    }

    // Verify the target user is in the same organization
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!targetUser) {
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    if (targetUser.organizationId !== organizationId) {
      return errorResponse(
        res,
        'FORBIDDEN',
        'Cannot edit data from another organization',
        403
      );
    }

    // Upsert weekly activity
    const activity = await prisma.weeklyActivity.upsert({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate,
        },
      },
      update: {
        mondayCalls: monday?.calls || 0,
        mondayEmails: monday?.emails || 0,
        mondayContacts: monday?.contacts || 0,
        mondayResponses: monday?.responses || 0,
        tuesdayCalls: tuesday?.calls || 0,
        tuesdayEmails: tuesday?.emails || 0,
        tuesdayContacts: tuesday?.contacts || 0,
        tuesdayResponses: tuesday?.responses || 0,
        wednesdayCalls: wednesday?.calls || 0,
        wednesdayEmails: wednesday?.emails || 0,
        wednesdayContacts: wednesday?.contacts || 0,
        wednesdayResponses: wednesday?.responses || 0,
        thursdayCalls: thursday?.calls || 0,
        thursdayEmails: thursday?.emails || 0,
        thursdayContacts: thursday?.contacts || 0,
        thursdayResponses: thursday?.responses || 0,
        fridayCalls: friday?.calls || 0,
        fridayEmails: friday?.emails || 0,
        fridayContacts: friday?.contacts || 0,
        fridayResponses: friday?.responses || 0,
      },
      create: {
        userId,
        weekStartDate,
        mondayCalls: monday?.calls || 0,
        mondayEmails: monday?.emails || 0,
        mondayContacts: monday?.contacts || 0,
        mondayResponses: monday?.responses || 0,
        tuesdayCalls: tuesday?.calls || 0,
        tuesdayEmails: tuesday?.emails || 0,
        tuesdayContacts: tuesday?.contacts || 0,
        tuesdayResponses: tuesday?.responses || 0,
        wednesdayCalls: wednesday?.calls || 0,
        wednesdayEmails: wednesday?.emails || 0,
        wednesdayContacts: wednesday?.contacts || 0,
        wednesdayResponses: wednesday?.responses || 0,
        thursdayCalls: thursday?.calls || 0,
        thursdayEmails: thursday?.emails || 0,
        thursdayContacts: thursday?.contacts || 0,
        thursdayResponses: thursday?.responses || 0,
        fridayCalls: friday?.calls || 0,
        fridayEmails: friday?.emails || 0,
        fridayContacts: friday?.contacts || 0,
        fridayResponses: friday?.responses || 0,
      },
    });

    return successResponse(res, activity, 'Team member activity updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of organizations (for registration)
 * GET /api/team/organizations
 */
const getOrganizations = async (req, res, next) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(res, organizations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeamMembers,
  getTeamMemberGoals,
  getTeamMemberActivity,
  updateTeamMemberActivity,
  getOrganizations,
};

