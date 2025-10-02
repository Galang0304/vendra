// Vendra CRM - Logging Middleware
const logger = process.env.VERCEL ? require('../utils/logger-vercel') : require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log incoming request
    logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous'
    });

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;
        
        // Log API request completion
        logger.apiRequest(req, res, responseTime);
        
        // Log slow requests
        if (responseTime > 2000) {
            logger.performance('Slow request', responseTime, {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode
            });
        }

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    // Log the error
    logger.error('Request error', err, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id || 'anonymous',
        statusCode: res.statusCode || 500
    });

    // Security logging for suspicious activities
    if (err.status === 401 || err.status === 403) {
        logger.security('Unauthorized access attempt', {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            error: err.message
        });
    }

    next(err);
};

// Database operation logging middleware
const dbLogger = (operation, table) => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Override to log after operation
        const originalSend = res.send;
        res.send = function(data) {
            const duration = Date.now() - startTime;
            
            logger.database(operation, table, {
                duration: `${duration}ms`,
                userId: req.user?.id || 'anonymous',
                success: res.statusCode < 400
            });

            originalSend.call(this, data);
        };

        next();
    };
};

// Authentication logging middleware
const authLogger = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function(data) {
            const success = res.statusCode < 400;
            
            logger.auth(action, req.body?.username || req.user?.id || 'unknown', {
                success,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                statusCode: res.statusCode
            });

            // Log failed authentication attempts
            if (!success && (action === 'login' || action === 'register')) {
                logger.security(`Failed ${action} attempt`, {
                    username: req.body?.username,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent')
                });
            }

            originalSend.call(this, data);
        };

        next();
    };
};

// Rate limiting logging
const rateLimitLogger = (req, res, next) => {
    // Check for rate limit headers
    if (res.get('X-RateLimit-Remaining') === '0') {
        logger.security('Rate limit exceeded', {
            ip: req.ip || req.connection.remoteAddress,
            url: req.originalUrl,
            userAgent: req.get('User-Agent')
        });
    }

    next();
};

// File upload logging
const uploadLogger = (req, res, next) => {
    if (req.file || req.files) {
        const files = req.files || [req.file];
        
        files.forEach(file => {
            logger.info('File uploaded', {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                userId: req.user?.id || 'anonymous',
                ip: req.ip || req.connection.remoteAddress
            });
        });
    }

    next();
};

// CSV import logging
const csvImportLogger = (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
        try {
            const responseData = JSON.parse(data);
            
            if (responseData.success) {
                logger.info('CSV import completed', {
                    imported: responseData.imported,
                    failed: responseData.failed || 0,
                    userId: req.user?.id || 'anonymous',
                    filename: req.file?.originalname
                });
            } else {
                logger.error('CSV import failed', null, {
                    error: responseData.message,
                    userId: req.user?.id || 'anonymous',
                    filename: req.file?.originalname
                });
            }
        } catch (e) {
            // If response is not JSON, just log basic info
            logger.info('CSV import response sent', {
                statusCode: res.statusCode,
                userId: req.user?.id || 'anonymous'
            });
        }

        originalSend.call(this, data);
    };

    next();
};

module.exports = {
    requestLogger,
    errorLogger,
    dbLogger,
    authLogger,
    rateLimitLogger,
    uploadLogger,
    csvImportLogger
};
