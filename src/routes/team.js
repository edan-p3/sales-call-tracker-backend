const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getTeamMembers,
  getTeamMemberGoals,
  getTeamMemberActivity,
  updateTeamMemberActivity,
  getOrganizations,
} = require('../controllers/teamController');

// Get list of organizations (PUBLIC - for registration/joining)
router.get('/organizations', getOrganizations);

// All other routes require authentication
router.use(authenticateToken);

// Get all team members
router.get('/members', getTeamMembers);

// Get specific team member's goals
router.get('/member/:userId/goals', getTeamMemberGoals);

// Get specific team member's weekly activity
router.get('/member/:userId/activity/:weekStart', getTeamMemberActivity);

// Update specific team member's weekly activity (managers can edit)
router.post('/member/:userId/activity', updateTeamMemberActivity);

module.exports = router;

