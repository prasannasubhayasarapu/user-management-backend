import AppError from '../utils/AppError.js';

// Development error details
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error details
const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('CRITICAL ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Global error handler middleware
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific errors
    if (err.name === 'CastError') {
      error = new AppError('Invalid ID format', 400);
    }
    if (err.code === 11000) {
      error = new AppError('Duplicate field value entered', 400);
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(el => el.message);
      error = new AppError(messages.join('. '), 400);
    }
    
    sendProdError(error, res);
  }
};