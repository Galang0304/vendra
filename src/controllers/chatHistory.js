const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class ChatHistoryController {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'business_crm',
            port: process.env.DB_PORT || 3306
        };
    }

    // Get all chat sessions
    async getChatSessions(req, res) {
        let connection;
        try {
            console.log('Fetching chat sessions...');
            connection = await mysql.createConnection(this.dbConfig);
            
            const [sessions] = await connection.execute(`
                SELECT 
                    session_id,
                    session_title,
                    created_at,
                    updated_at,
                    message_count,
                    (SELECT message_text FROM chat_messages 
                     WHERE session_id = cs.session_id 
                     ORDER BY timestamp DESC LIMIT 1) as last_message
                FROM chat_sessions cs 
                WHERE is_active = TRUE 
                ORDER BY updated_at DESC
            `);

            console.log(`Found ${sessions.length} chat sessions`);
            
            res.json({
                success: true,
                sessions: sessions
            });

        } catch (error) {
            console.error('Error fetching chat sessions:', error);
            logger.error('Error fetching chat sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch chat sessions',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    // Get messages from specific session
    async getSessionMessages(req, res) {
        let connection;
        try {
            const { sessionId } = req.params;
            connection = await mysql.createConnection(this.dbConfig);
            
            const [messages] = await connection.execute(`
                SELECT 
                    message_id,
                    sender,
                    message_text,
                    timestamp,
                    tokens_used,
                    response_time_ms
                FROM chat_messages 
                WHERE session_id = ? 
                ORDER BY timestamp ASC
            `, [sessionId]);

            res.json({
                success: true,
                sessionId: sessionId,
                messages: messages
            });

        } catch (error) {
            logger.error('Error fetching session messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch session messages',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    // Create new chat session
    async createSession(req, res) {
        let connection;
        try {
            const { title } = req.body;
            const sessionId = uuidv4();
            
            connection = await mysql.createConnection(this.dbConfig);
            
            await connection.execute(`
                INSERT INTO chat_sessions (session_id, session_title, user_id) 
                VALUES (?, ?, ?)
            `, [sessionId, title || 'New Chat', 'admin']);

            res.json({
                success: true,
                sessionId: sessionId,
                title: title || 'New Chat'
            });

        } catch (error) {
            logger.error('Error creating chat session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create chat session',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    // Save message to session
    async saveMessage(req, res) {
        let connection;
        try {
            const { sessionId, sender, message, tokensUsed = 0, responseTime = 0 } = req.body;
            
            connection = await mysql.createConnection(this.dbConfig);
            
            // Insert message
            await connection.execute(`
                INSERT INTO chat_messages (session_id, sender, message_text, tokens_used, response_time_ms) 
                VALUES (?, ?, ?, ?, ?)
            `, [sessionId, sender, message, tokensUsed, responseTime]);

            // Update session message count and timestamp
            await connection.execute(`
                UPDATE chat_sessions 
                SET message_count = message_count + 1, updated_at = CURRENT_TIMESTAMP 
                WHERE session_id = ?
            `, [sessionId]);

            res.json({
                success: true,
                message: 'Message saved successfully'
            });

        } catch (error) {
            logger.error('Error saving message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save message',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    // Update session title
    async updateSessionTitle(req, res) {
        let connection;
        try {
            const { sessionId } = req.params;
            const { title } = req.body;
            
            connection = await mysql.createConnection(this.dbConfig);
            
            await connection.execute(`
                UPDATE chat_sessions 
                SET session_title = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE session_id = ?
            `, [title, sessionId]);

            res.json({
                success: true,
                message: 'Session title updated successfully'
            });

        } catch (error) {
            logger.error('Error updating session title:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update session title',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    // Delete chat session
    async deleteSession(req, res) {
        let connection;
        try {
            const { sessionId } = req.params;
            
            connection = await mysql.createConnection(this.dbConfig);
            
            // Soft delete - mark as inactive
            await connection.execute(`
                UPDATE chat_sessions 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
                WHERE session_id = ?
            `, [sessionId]);

            res.json({
                success: true,
                message: 'Session deleted successfully'
            });

        } catch (error) {
            logger.error('Error deleting session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete session',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    // Get chat statistics
    async getChatStats(req, res) {
        let connection;
        try {
            connection = await mysql.createConnection(this.dbConfig);
            
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(DISTINCT cs.session_id) as total_sessions,
                    COUNT(cm.message_id) as total_messages,
                    SUM(cm.tokens_used) as total_tokens,
                    AVG(cm.response_time_ms) as avg_response_time,
                    MAX(cs.updated_at) as last_activity
                FROM chat_sessions cs
                LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id
                WHERE cs.is_active = TRUE
            `);

            res.json({
                success: true,
                stats: stats[0]
            });

        } catch (error) {
            logger.error('Error fetching chat stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch chat statistics',
                error: error.message
            });
        } finally {
            if (connection) await connection.end();
        }
    }
}

module.exports = new ChatHistoryController();
