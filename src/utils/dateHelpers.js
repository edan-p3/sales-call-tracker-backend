/**
 * Check if a date string is a Monday
 */
const isMonday = (dateString) => {
  const date = new Date(dateString);
  return date.getDay() === 1;
};

/**
 * Get the Monday of the week for a given date
 */
const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const isValidDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

module.exports = {
  isMonday,
  getMondayOfWeek,
  isValidDateFormat,
};

