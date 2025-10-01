const express = require('express');
const axios = require('axios');
const router = express.Router();
const aiController = require('../controllers/ai');

// AI Chat endpoint
router.post('/chat', (req, res) => aiController.chatWithAI(req, res));

// Generate business insights
router.post('/insights', (req, res) => aiController.generateBusinessInsights(req, res));

// Analyze customer data
router.post('/analyze-customers', (req, res) => aiController.analyzeCustomerData(req, res));

// Get business improvement suggestions
router.post('/suggestions', (req, res) => aiController.getBusinessSuggestions(req, res));

// Test AI connection
router.get('/test', async (req, res) => {
    try {
        const testMessage = "Hello, this is a test message. Please respond with 'AI connection successful!'";
        
        const response = await require('../controllers/ai').callGeminiAPI(testMessage);
        
        res.json({
            success: true,
            message: 'AI connection test successful',
            response: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'AI connection test failed',
            error: error.message
        });
    }
});

// Check API usage and limits
router.get('/usage', async (req, res) => {
    try {
        // Make a minimal API call to get headers
        const aiController = require('../controllers/ai');
        
        const testResponse = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: {
                'X-goog-api-key': process.env.GEMINI_API_KEY || 'AIzaSyBautBE5Nk49TEsPl69u2QQW3AVpjdAI_0'
            }
        });

        res.json({
            success: true,
            usage: {
                rateLimit: {
                    limit: testResponse.headers['x-ratelimit-limit'] || 'Not available',
                    remaining: testResponse.headers['x-ratelimit-remaining'] || 'Not available',
                    reset: testResponse.headers['x-ratelimit-reset'] || 'Not available'
                },
                quota: {
                    daily: testResponse.headers['x-quota-daily'] || 'Not available',
                    monthly: testResponse.headers['x-quota-monthly'] || 'Not available'
                },
                apiKey: {
                    status: 'Active',
                    lastUsed: new Date().toISOString()
                }
            },
            info: {
                message: 'Gemini API limits are typically:',
                freeTier: {
                    requestsPerMinute: 15,
                    requestsPerDay: 1500,
                    tokensPerMinute: 32000,
                    tokensPerDay: 50000
                },
                paidTier: {
                    requestsPerMinute: 360,
                    requestsPerDay: 'No limit',
                    tokensPerMinute: 120000,
                    tokensPerDay: 'No limit'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check API usage',
            error: error.message,
            info: {
                message: 'Default Gemini API limits (Free Tier):',
                limits: {
                    requestsPerMinute: 15,
                    requestsPerDay: 1500,
                    tokensPerMinute: 32000,
                    tokensPerDay: 50000
                },
                note: 'Actual limits may vary. Check Google AI Studio for exact quotas.'
            }
        });
    }
});

module.exports = router;
