/**
 * Global Error Handler Middleware
 * Catch all errors passed to next(error) and return a consistent JSON response.
 */
function errorHandler(err, req, res, next) {
    console.error('❌ [Error]:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // Custom status codes based on error message or type
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error patterns
    if (message.includes('already exists')) statusCode = 409;
    if (message.includes('required')) statusCode = 400;
    if (message.includes('Invalid') || message.includes('expired')) statusCode = 401;

    res.status(statusCode).json({
        success: false,
        message: message,
        // Only show stack in development
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

module.exports = errorHandler;
