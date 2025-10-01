// Vendra CRM - Frontend Error Logger
class FrontendLogger {
    constructor() {
        this.apiEndpoint = '/api/logs/frontend';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.logQueue = [];
        this.isOnline = navigator.onLine;
        this.rateLimitMap = new Map(); // For rate limiting
        this.maxLogsPerMinute = 10;
        
        this.init();
    }

    init() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        });

        // Network status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushLogQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Console error override
        this.overrideConsole();
    }

    overrideConsole() {
        const originalError = console.error;
        const originalWarn = console.warn;

        console.error = (...args) => {
            originalError.apply(console, args);
            this.logError('Console Error', {
                message: args.join(' '),
                url: window.location.href,
                timestamp: new Date().toISOString()
            });
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.logWarning('Console Warning', {
                message: args.join(' '),
                url: window.location.href,
                timestamp: new Date().toISOString()
            });
        };
    }

    async sendLog(level, message, meta = {}) {
        // Prevent infinite loops by not logging our own API calls
        if (message && message.includes('/api/logs/frontend')) {
            return;
        }

        // Rate limiting check
        if (!this.checkRateLimit(message)) {
            return;
        }

        const logData = {
            level,
            message,
            meta: {
                ...meta,
                userId: this.getUserId(),
                sessionId: this.getSessionId(),
                browserInfo: this.getBrowserInfo(),
                performanceInfo: this.getPerformanceInfo()
            }
        };

        if (!this.isOnline) {
            this.logQueue.push(logData);
            this.saveToLocalStorage();
            return;
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(logData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            // Only queue for retry if it's not a logging API error
            if (!error.message.includes('logs/frontend')) {
                this.logQueue.push(logData);
                this.saveToLocalStorage();
            }
            // Don't log this error to prevent infinite loop
        }
    }

    logError(message, meta = {}) {
        this.sendLog('ERROR', message, meta);
    }

    logWarning(message, meta = {}) {
        this.sendLog('WARN', message, meta);
    }

    logInfo(message, meta = {}) {
        this.sendLog('INFO', message, meta);
    }

    logDebug(message, meta = {}) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.sendLog('DEBUG', message, meta);
        }
    }

    // API call logging
    logApiCall(method, url, status, responseTime, error = null) {
        const level = error ? 'ERROR' : (status >= 400 ? 'WARN' : 'INFO');
        
        this.sendLog(level, `API Call: ${method} ${url}`, {
            method,
            url,
            status,
            responseTime,
            error: error?.message,
            timestamp: new Date().toISOString()
        });
    }

    // User action logging
    logUserAction(action, element, meta = {}) {
        this.logInfo(`User Action: ${action}`, {
            action,
            element: element?.tagName || element,
            elementId: element?.id,
            elementClass: element?.className,
            url: window.location.href,
            ...meta
        });
    }

    // Performance logging
    logPerformance(metric, value, meta = {}) {
        this.logInfo(`Performance: ${metric}`, {
            metric,
            value,
            url: window.location.href,
            ...meta
        });
    }

    // Page load logging
    logPageLoad() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        this.logInfo('Page Load', {
            loadTime,
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }

    // Chart error logging
    logChartError(chartType, error) {
        this.logError(`Chart Error: ${chartType}`, {
            chartType,
            error: error.message,
            stack: error.stack,
            url: window.location.href
        });
    }

    // CSV upload logging
    logCsvUpload(filename, size, success, error = null) {
        const level = success ? 'INFO' : 'ERROR';
        
        this.sendLog(level, 'CSV Upload', {
            filename,
            size,
            success,
            error: error?.message,
            timestamp: new Date().toISOString()
        });
    }

    // Authentication logging
    logAuth(action, success, error = null) {
        const level = success ? 'INFO' : 'WARN';
        
        this.sendLog(level, `Auth: ${action}`, {
            action,
            success,
            error: error?.message,
            timestamp: new Date().toISOString()
        });
    }

    getUserId() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.id || 'anonymous';
        } catch {
            return 'anonymous';
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getPerformanceInfo() {
        if (!performance.memory) return {};
        
        return {
            memoryUsed: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            memoryTotal: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            memoryLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }

    flushLogQueue() {
        if (this.logQueue.length === 0) return;

        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        logsToSend.forEach(logData => {
            this.sendLog(logData.level, logData.message, logData.meta);
        });

        this.clearLocalStorage();
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('pendingLogs', JSON.stringify(this.logQueue));
        } catch (error) {
            console.warn('Failed to save logs to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const pendingLogs = localStorage.getItem('pendingLogs');
            if (pendingLogs) {
                this.logQueue = JSON.parse(pendingLogs);
            }
        } catch (error) {
            console.warn('Failed to load logs from localStorage:', error);
        }
    }

    clearLocalStorage() {
        localStorage.removeItem('pendingLogs');
    }

    // Rate limiting to prevent spam
    checkRateLimit(message) {
        const now = Date.now();
        const key = message.substring(0, 50); // Use first 50 chars as key
        
        if (!this.rateLimitMap.has(key)) {
            this.rateLimitMap.set(key, []);
        }
        
        const timestamps = this.rateLimitMap.get(key);
        
        // Remove timestamps older than 1 minute
        const oneMinuteAgo = now - 60000;
        const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);
        
        // Check if we've exceeded the limit
        if (recentTimestamps.length >= this.maxLogsPerMinute) {
            return false; // Rate limited
        }
        
        // Add current timestamp
        recentTimestamps.push(now);
        this.rateLimitMap.set(key, recentTimestamps);
        
        return true; // Allow logging
    }

    // Get client-side error statistics
    getErrorStats() {
        const stats = {
            totalErrors: 0,
            errorTypes: {},
            recentErrors: []
        };

        // This would typically be stored in localStorage or sent to server
        return stats;
    }
}

// Create global instance
window.frontendLogger = new FrontendLogger();

// Auto-log page load
window.addEventListener('load', () => {
    window.frontendLogger.logPageLoad();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendLogger;
}
