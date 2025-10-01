const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupChatHistory() {
    let connection;
    try {
        console.log('🔄 Setting up chat history tables...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'business_crm',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        // Create chat_sessions table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                session_id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(50) DEFAULT 'admin',
                session_title VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                message_count INT DEFAULT 0
            )
        `);
        console.log('✅ chat_sessions table created');

        // Create chat_messages table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                message_id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(36),
                sender ENUM('user', 'ai') NOT NULL,
                message_text TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tokens_used INT DEFAULT 0,
                response_time_ms INT DEFAULT 0,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
                INDEX idx_session_timestamp (session_id, timestamp)
            )
        `);
        console.log('✅ chat_messages table created');

        // Insert sample data
        await connection.execute(`
            INSERT IGNORE INTO chat_sessions (session_id, session_title, message_count) VALUES
            ('default-session', 'Chat Pertama dengan AI', 0),
            ('business-analysis', 'Analisis Bisnis CRM', 0),
            ('customer-insights', 'Wawasan Pelanggan', 0)
        `);
        console.log('✅ Sample sessions inserted');

        console.log('🎉 Chat history setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up chat history:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    setupChatHistory();
}

module.exports = setupChatHistory;
