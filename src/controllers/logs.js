// Vendra CRM - Logs Controller
const express = require('express');
const logger = require('../utils/logger');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Frontend error logging endpoint
router.post('/frontend', authenticateToken, (req, res) => {
    try {
        const { level, message, meta } = req.body;
        
        if (!level || !message) {
            return res.status(400).json({
                success: false,
                message: 'Level and message are required'
            });
        }

        // Add request info to meta
        const enrichedMeta = {
            ...meta,
            serverTimestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous'
        };

        // Log based on level
        switch (level.toUpperCase()) {
            case 'ERROR':
                logger.error(`[FRONTEND] ${message}`, null, enrichedMeta);
                break;
            case 'WARN':
                logger.warn(`[FRONTEND] ${message}`, enrichedMeta);
                break;
            case 'INFO':
                logger.info(`[FRONTEND] ${message}`, enrichedMeta);
                break;
            case 'DEBUG':
                logger.debug(`[FRONTEND] ${message}`, enrichedMeta);
                break;
            default:
                logger.info(`[FRONTEND] ${message}`, enrichedMeta);
        }

        res.json({
            success: true,
            message: 'Log recorded successfully'
        });

    } catch (error) {
        logger.error('Error processing frontend log', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process log'
        });
    }
});

// Get log statistics
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const stats = logger.getLogStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error getting log stats', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get log statistics'
        });
    }
});

// Clean old logs (admin only)
router.post('/clean', authenticateToken, (req, res) => {
    try {
        // Check if user is admin (you might want to add role checking)
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        logger.cleanOldLogs();
        logger.info('Log cleanup initiated', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Log cleanup completed'
        });
    } catch (error) {
        logger.error('Error cleaning logs', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clean logs'
        });
    }
});

// Get recent errors (admin only)
router.get('/errors', authenticateToken, (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const fs = require('fs');
        const path = require('path');
        const errorLogPath = path.join(__dirname, '../../logs/error.log');

        if (!fs.existsSync(errorLogPath)) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Read last 100 lines of error log
        const logContent = fs.readFileSync(errorLogPath, 'utf8');
        const lines = logContent.split('\n').filter(line => line.trim());
        const recentLines = lines.slice(-100);

        const errors = recentLines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return { message: line, timestamp: new Date().toISOString() };
            }
        });

        res.json({
            success: true,
            data: errors.reverse() // Most recent first
        });

    } catch (error) {
        logger.error('Error reading error logs', error);
        res.status(500).json({
            success: false,
            message: 'Failed to read error logs'
        });
    }
});

// Health check endpoint with logging
router.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    };

    logger.info('Health check performed', healthData);

    res.json({
        success: true,
        data: healthData
    });
});

module.exports = router;
