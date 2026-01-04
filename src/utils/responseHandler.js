/**
 * Standard success response format
 */
const successResponse = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 */
const errorResponse = (res, code, message, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};

