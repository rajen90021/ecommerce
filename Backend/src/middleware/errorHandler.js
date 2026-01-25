import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message.replace(/^Validation error:\s*/, '')).join(', ');
  }

  const response = {
    success: false,
    status: 'error',
    statusCode,
    message,
  };

  // Attach detailed validation errors if they exist
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};
