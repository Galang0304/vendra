// Vendra CRM - Vercel Compatible Logger
class Logger {
    constructor() {
        this.isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
    }

    formatTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 19);
    }

    formatLogEntry(level, message, meta = {}) {
        const timestamp = this.formatTimestamp();
        return {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        };
    }

    // Console-only logging for Vercel
    log(level, message, meta = {}) {
        const logEntry = this.formatLogEntry(level, message, meta);
        
        if (this.isVercel) {
            // Vercel: hanya console logging
            console.log(JSON.stringify(logEntry));
        } else {
            // Local: console + file (jika memungkinkan)
            console.log(`[${level.toUpperCase()}] ${message}`, meta);
            
            // Try to write to file, but don't fail if can't
            try {
                const fs = require('fs');
                const path = require('path');
                const logDir = path.join(__dirname, '../../logs');
                
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                
                const content = JSON.stringify(logEntry) + '\n';
                fs.appendFileSync(path.join(logDir, 'app.log'), content, 'utf8');
            } catch (error) {
                // Silently ignore file write errors
                console.log('Note: Could not write to log file (running in read-only environment)');
            }
        }
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

        this.log('ERROR', message, errorMeta);
        
        // Console error for visibility
        if (error) {
            console.error(`[ERROR] ${message}:`, error);
        }
    }

    // Warning logging
    warn(message, meta = {}) {
        this.log('WARN', message, meta);
    }

    // Info logging
    info(message, meta = {}) {
        this.log('INFO', message, meta);
    }

    // Debug logging
    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            this.log('DEBUG', message, meta);
        }
    }

    // API request logging
    apiRequest(req, res, responseTime) {
        this.log('API', 'Request processed', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent')
        });
    }

    // Performance logging
    performance(message, duration, meta = {}) {
        this.log('PERF', message, {
            duration: `${duration}ms`,
            ...meta
        });
        
        // Log slow operations
        if (duration > 5000) {
            console.warn(`[SLOW] ${message}: ${duration}ms`);
        }
    }

    // Database logging
    database(operation, meta = {}) {
        this.log('DB', operation, meta);
    }

    // Authentication logging
    auth(message, meta = {}) {
        this.log('AUTH', message, meta);
    }

    // Import/Export logging
    import(message, meta = {}) {
        this.log('IMPORT', message, meta);
    }

    // AI/Analytics logging
    ai(message, meta = {}) {
        this.log('AI', message, meta);
    }
}

// Export singleton instance
module.exports = new Logger();