const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/activity/week/:weekStartDate
 * @desc    Get activity for a specific week
 * @access  Private
 */
router.get(
  '/week/:weekStartDate',
  authenticateToken,
  [
    param('weekStartDate')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
  ],
  validate,
  activityController.getWeekActivity
);

/**
 * @route   POST /api/activity/week
 * @desc    Create or update weekly activity
 * @access  Private
 */
router.post(
  '/week',
  authenticateToken,
  [
    body('weekStartDate')
      .notEmpty()
      .withMessage('Week start date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
    body('monday.calls')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Monday calls must be a non-negative integer'),
    body('monday.emails')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Monday emails must be a non-negative integer'),
    body('monday.contacts')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Monday contacts must be a non-negative integer'),
    body('monday.responses')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Monday responses must be a non-negative integer'),
    // Similar validation for other days would be here in production
  ],
  validate,
  activityController.saveWeekActivity
);

/**
 * @route   GET /api/activity/all
 * @desc    Get all weekly activities for current user
 * @access  Private
 */
router.get(
  '/all',
  authenticateToken,
  [
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
  activityController.getAllActivities
);

module.exports = router;

