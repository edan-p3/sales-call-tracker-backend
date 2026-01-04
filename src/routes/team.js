const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getTeamMembers,
  getTeamMemberGoals,
  getTeamMemberActivity,
  updateTeamMemberActivity,
  getOrganizations,
} = require('../controllers/teamController');

// All routes require authentication
router.use(authenticate);

// Get list of organizations (for registration/joining)
router.get('/organizations', getOrganizations);

// Get all team members
router.get('/members', getTeamMembers);

// Get specific team member's goals
router.get('/member/:userId/goals', getTeamMemberGoals);

// Get specific team member's weekly activity
router.get('/member/:userId/activity/:weekStart', getTeamMemberActivity);

// Update specific team member's weekly activity (managers can edit)
router.post('/member/:userId/activity', updateTeamMemberActivity);

module.exports = router;

