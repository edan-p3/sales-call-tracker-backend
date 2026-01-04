const express = require('express');
const { param, query } = require('express-validator');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/users
 * @desc    Get all users in organization
 * @access  Private (admin/manager only)
 */
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'manager'),
  usersController.getAllUsers
);

/**
 * @route   GET /api/users/:userId/activity/week/:weekStartDate
 * @desc    Get specific user's activity for a week
 * @access  Private (admin/manager only)
 */
router.get(
  '/:userId/activity/week/:weekStartDate',
  authenticateToken,
  requireRole('admin', 'manager'),
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    param('weekStartDate')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
  ],
  validate,
  usersController.getUserWeekActivity
);

/**
 * @route   GET /api/users/:userId/activity/all
 * @desc    Get all activities for a specific user
 * @access  Private (admin/manager only)
 */
router.get(
  '/:userId/activity/all',
  authenticateToken,
  requireRole('admin', 'manager'),
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('startDate')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Start date must be in YYYY-MM-DD format'),
    query('endDate')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('End date must be in YYYY-MM-DD format'),
  ],
  validate,
  usersController.getUserAllActivities
);

module.exports = router;

