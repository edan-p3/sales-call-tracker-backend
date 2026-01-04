/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 number
 */
const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Validate all numeric values are non-negative
 */
const areValidMetrics = (metrics) => {
  for (const key in metrics) {
    if (typeof metrics[key] === 'number' && metrics[key] < 0) {
      return false;
    }
  }
  return true;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  areValidMetrics,
};

