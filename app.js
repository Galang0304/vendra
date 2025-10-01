const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import utilities
const logger = require('./src/utils/logger');
const { requestLogger, errorLogger } = require('./src/middleware/logging');

// Import routes
const authRoutes = require('./src/controllers/auth');
const dashboardRoutes = require('./src/controllers/dashboard');
const importRoutes = require('./src/controllers/import');
const logsRoutes = require('./src/controllers/logs');
const statisticsRoutes = require('./src/controllers/statistics');
const aiRoutes = require('./src/routes/ai');
const chatHistoryRoutes = require('./src/routes/chatHistory');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/import', importRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat-history', chatHistoryRoutes);

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/dashboard.html'));
});

app.get('/statistics', (req, res) => {
    logger.info('Statistics page requested');
    res.sendFile(path.join(__dirname, 'public/views/statistics.html'));
});

app.get('/ai-analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/ai-analytics.html'));
});

app.get('/import-data', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/import-data.html'));
});

app.get('/csv-templates', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/csv-templates.html'));
});

app.get('/templates', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/csv-templates.html'));
});

app.get('/logs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/logs.html'));
});

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Business CRM Suite Server');
    console.log(`📊 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Login: admin / admin123`);
    console.log('✨ Ready to serve customers!');
});
