const express = require('express');
const router = express.Router();
const chatHistoryController = require('../controllers/chatHistory');

// Get all chat sessions
router.get('/sessions', (req, res) => chatHistoryController.getChatSessions(req, res));

// Get messages from specific session
router.get('/sessions/:sessionId/messages', (req, res) => chatHistoryController.getSessionMessages(req, res));

// Create new chat session
router.post('/sessions', (req, res) => chatHistoryController.createSession(req, res));

// Save message to session
router.post('/messages', (req, res) => chatHistoryController.saveMessage(req, res));

// Update session title
router.put('/sessions/:sessionId/title', (req, res) => chatHistoryController.updateSessionTitle(req, res));

// Delete chat session
router.delete('/sessions/:sessionId', (req, res) => chatHistoryController.deleteSession(req, res));

// Get chat statistics
router.get('/stats', (req, res) => chatHistoryController.getChatStats(req, res));

module.exports = router;
