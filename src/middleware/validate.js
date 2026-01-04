const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Handle express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return errorResponse(
      res,
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      errorDetails
    );
  }

  next();
};

module.exports = validate;

