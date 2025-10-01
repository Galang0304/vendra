// Vendra CRM - Logger Utility
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 19);
    }

    formatLogEntry(level, message, meta = {}) {
        const timestamp = this.formatTimestamp();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        };

        return JSON.stringify(logEntry) + '\n';
    }

    writeToFile(filename, content) {
        const filePath = path.join(this.logDir, filename);
        fs.appendFileSync(filePath, content, 'utf8');
    }

    // Error logging
    error(message, error = null, meta = {}) {
        const errorMeta = {
            ...meta,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null
        };

        const logEntry = this.formatLogEntry('ERROR', message, errorMeta);
        
        // Write to error log
        this.writeToFile('error.log', logEntry);
        
        // Also write to general log
        this.writeToFile('app.log', logEntry);
        
        // Console output for development
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[ERROR] ${message}`, error);
        }
    }

    // Warning logging
    warn(message, meta = {}) {
        const logEntry = this.formatLogEntry('WARN', message, meta);
        
        this.writeToFile('app.log', logEntry);
        
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${message}`);
        }
    }

    // Info logging
    info(message, meta = {}) {
        const logEntry = this.formatLogEntry('INFO', message, meta);
        
        this.writeToFile('app.log', logEntry);
        
        if (process.env.NODE_ENV !== 'production') {
            console.info(`[INFO] ${message}`);
        }
    }

    // Debug logging
    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            const logEntry = this.formatLogEntry('DEBUG', message, meta);
            
            this.writeToFile('debug.log', logEntry);
            console.debug(`[DEBUG] ${message}`);
        }
    }

    // API request logging
    apiRequest(req, res, responseTime) {
        const logEntry = this.formatLogEntry('API', 'Request processed', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || 'anonymous'
        });

        this.writeToFile('api.log', logEntry);
    }

    // Database operation logging
    database(operation, table, meta = {}) {
        const logEntry = this.formatLogEntry('DB', `${operation} on ${table}`, meta);
        
        this.writeToFile('database.log', logEntry);
        
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DB] ${operation} on ${table}`);
        }
    }

    // Authentication logging
    auth(action, userId, meta = {}) {
        const logEntry = this.formatLogEntry('AUTH', action, {
            userId,
            ...meta
        });

        this.writeToFile('auth.log', logEntry);
        
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[AUTH] ${action} - User: ${userId}`);
        }
    }

    // Security logging
    security(event, meta = {}) {
        const logEntry = this.formatLogEntry('SECURITY', event, meta);
        
        this.writeToFile('security.log', logEntry);
        
        // Always log security events to console
        console.warn(`[SECURITY] ${event}`, meta);
    }

    // Performance logging
    performance(operation, duration, meta = {}) {
        const logEntry = this.formatLogEntry('PERF', operation, {
            duration: `${duration}ms`,
            ...meta
        });

        this.writeToFile('performance.log', logEntry);
        
        if (duration > 1000) { // Log slow operations
            console.warn(`[PERF] Slow operation: ${operation} took ${duration}ms`);
        }
    }

    // Clean old logs (keep last 30 days)
    cleanOldLogs() {
        const files = fs.readdirSync(this.logDir);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        files.forEach(file => {
            const filePath = path.join(this.logDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime < thirtyDaysAgo) {
                fs.unlinkSync(filePath);
                console.log(`Deleted old log file: ${file}`);
            }
        });
    }

    // Get log statistics
    getLogStats() {
        const files = fs.readdirSync(this.logDir);
        const stats = {};

        files.forEach(file => {
            const filePath = path.join(this.logDir, file);
            const fileStats = fs.statSync(filePath);
            
            stats[file] = {
                size: fileStats.size,
                created: fileStats.birthtime,
                modified: fileStats.mtime
            };
        });

        return stats;
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
