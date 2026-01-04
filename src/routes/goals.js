const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const goalsController = require('../controllers/goalsController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/goals
 * @desc    Get current user's goals
 * @access  Private
 */
router.get('/', authenticateToken, goalsController.getGoals);

/**
 * @route   PUT /api/goals
 * @desc    Update user's goals
 * @access  Private
 */
router.put(
  '/',
  authenticateToken,
  [
    body('callsPerDay')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Calls per day must be a non-negative integer'),
    body('emailsPerDay')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Emails per day must be a non-negative integer'),
    body('contactsPerDay')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Contacts per day must be a non-negative integer'),
    body('responsesPerDay')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Responses per day must be a non-negative integer'),
    body('callsPerWeek')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Calls per week must be a non-negative integer'),
    body('emailsPerWeek')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Emails per week must be a non-negative integer'),
    body('contactsPerWeek')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Contacts per week must be a non-negative integer'),
    body('responsesPerWeek')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Responses per week must be a non-negative integer'),
  ],
  validate,
  goalsController.updateGoals
);

module.exports = router;

