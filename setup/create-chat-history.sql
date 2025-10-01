-- Create chat history tables for AI conversations
USE business_crm;

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(50) DEFAULT 'admin',
    session_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    message_count INT DEFAULT 0
);

-- Chat messages table
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
);

-- Insert sample data
INSERT IGNORE INTO chat_sessions (session_id, session_title, message_count) VALUES
('default-session', 'Chat Pertama dengan AI', 0),
('business-analysis', 'Analisis Bisnis CRM', 0),
('customer-insights', 'Wawasan Pelanggan', 0);

SELECT 'Chat history tables created successfully!' as status;
