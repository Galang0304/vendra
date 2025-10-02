const mysql = require('mysql2/promise');

async function setupOnlineDatabase() {
    console.log('🚀 Setting up Vendra CRM Database Online...\n');
    
    const config = {
        host: 'sql12.freesqldatabase.com',
        user: 'sql12800978',
        password: 'yzJDq4BqVk',
        database: 'sql12800978',
        port: 3306,
        connectTimeout: 60000
    };
    
    try {
        console.log('📡 Connecting to online database...');
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected successfully!\n');
        
        // Drop existing tables if they exist (clean start)
        console.log('🧹 Cleaning existing tables...');
        const dropTables = [
            'DROP TABLE IF EXISTS chat_messages',
            'DROP TABLE IF EXISTS chat_sessions', 
            'DROP TABLE IF EXISTS customer_transactions',
            'DROP TABLE IF EXISTS import_history',
            'DROP TABLE IF EXISTS users'
        ];
        
        for (const dropQuery of dropTables) {
            try {
                await connection.execute(dropQuery);
            } catch (error) {
                // Ignore errors for non-existing tables
            }
        }
        
        console.log('✅ Tables cleaned\n');
        
        // Create users table
        console.log('👥 Creating users table...');
        await connection.execute(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
                phone VARCHAR(20),
                avatar VARCHAR(255),
                status ENUM('active', 'inactive') DEFAULT 'active',
                last_login DATETIME NULL,
                created_at DATETIME,
                updated_at DATETIME
            )
        `);
        console.log('✅ Users table created');
        
        // Create customer_transactions table
        console.log('📊 Creating customer_transactions table...');
        await connection.execute(`
            CREATE TABLE customer_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                import_id INT,
                customer_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                product_type VARCHAR(100),
                purchase_amount DECIMAL(15,2),
                purchase_date DATE,
                payment_method VARCHAR(100),
                sales_rep VARCHAR(255),
                customer_segment VARCHAR(50) DEFAULT 'Regular',
                created_at DATETIME
            )
        `);
        console.log('✅ Customer transactions table created');
        
        // Create import_history table
        console.log('📁 Creating import_history table...');
        await connection.execute(`
            CREATE TABLE import_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                original_filename VARCHAR(255) NOT NULL,
                stored_filename VARCHAR(255),
                total_rows INT DEFAULT 0,
                successful_rows INT DEFAULT 0,
                failed_rows INT DEFAULT 0,
                status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
                error_message TEXT,
                import_date DATETIME,
                file_size BIGINT,
                processed_by INT
            )
        `);
        console.log('✅ Import history table created');
        
        // Create chat_sessions table
        console.log('💬 Creating chat_sessions table...');
        await connection.execute(`
            CREATE TABLE chat_sessions (
                session_id VARCHAR(36) PRIMARY KEY,
                user_id INT,
                session_name VARCHAR(255),
                created_at DATETIME,
                last_activity DATETIME,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);
        console.log('✅ Chat sessions table created');
        
        // Create chat_messages table
        console.log('📝 Creating chat_messages table...');
        await connection.execute(`
            CREATE TABLE chat_messages (
                message_id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(36),
                sender ENUM('user','ai') NOT NULL,
                message_text TEXT NOT NULL,
                timestamp DATETIME,
                tokens_used INT DEFAULT 0,
                response_time_ms INT DEFAULT 0
            )
        `);
        console.log('✅ Chat messages table created');
        
        // Insert default admin user
        console.log('👨‍💼 Creating default admin user...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await connection.execute(`
            INSERT INTO users (username, email, password, full_name, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, ['admin', 'admin@vendra.com', hashedPassword, 'System Administrator', 'admin', 'active']);
        console.log('✅ Default admin user created (admin/admin123)');
        
        // Insert sample data
        console.log('🎯 Inserting sample transaction data...');
        
        const sampleTransactions = [
            ['John Doe', 'john@email.com', '08123456789', 'Electronics', 1500000, '2024-01-15', 'Credit Card', 'Sarah Johnson', 'VIP'],
            ['Jane Smith', 'jane@email.com', '08198765432', 'Clothing', 750000, '2024-01-16', 'Cash', 'Mike Chen', 'Regular'],
            ['Bob Wilson', 'bob@email.com', '08111222333', 'Home & Garden', 2300000, '2024-01-17', 'Bank Transfer', 'Lisa Wong', 'Premium'],
            ['Alice Brown', 'alice@email.com', '08555666777', 'Electronics', 3200000, '2024-01-18', 'Credit Card', 'Sarah Johnson', 'VIP'],
            ['Charlie Davis', 'charlie@email.com', '08999888777', 'Sports', 890000, '2024-01-19', 'E-wallet', 'Tom Rodriguez', 'Regular'],
            ['Diana Prince', 'diana@email.com', '08777666555', 'Health & Beauty', 650000, '2024-01-20', 'Credit Card', 'Lisa Wong', 'Regular'],
            ['Eva Martinez', 'eva@email.com', '08444333222', 'Books', 450000, '2024-01-21', 'Cash', 'Mike Chen', 'New'],
            ['Frank Miller', 'frank@email.com', '08666555444', 'Automotive', 5500000, '2024-01-22', 'Bank Transfer', 'Sarah Johnson', 'Premium'],
            ['Grace Lee', 'grace@email.com', '08888999000', 'Food & Beverage', 320000, '2024-01-23', 'E-wallet', 'Tom Rodriguez', 'Regular'],
            ['Henry Kim', 'henry@email.com', '08222333444', 'Electronics', 2800000, '2024-01-24', 'Credit Card', 'Lisa Wong', 'Premium']
        ];
        
        for (const transaction of sampleTransactions) {
            await connection.execute(`
                INSERT INTO customer_transactions 
                (customer_name, email, phone, product_type, purchase_amount, purchase_date, payment_method, sales_rep, customer_segment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, transaction);
        }
        console.log(`✅ Inserted ${sampleTransactions.length} sample transactions`);
        
        // Create import history entry
        await connection.execute(`
            INSERT INTO import_history 
            (original_filename, stored_filename, total_rows, successful_rows, failed_rows, status, processed_by, import_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, ['sample_data.csv', 'sample_data_processed.csv', 10, 10, 0, 'completed', 1]);
        console.log('✅ Sample import history created');
        
        // Verify setup
        console.log('\n🔍 Verifying database setup...');
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tables created: ${tables.length}`);
        
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Users: ${userCount[0].count}`);
        
        const [transactionCount] = await connection.execute('SELECT COUNT(*) as count FROM customer_transactions');
        console.log(`📊 Transactions: ${transactionCount[0].count}`);
        
        const [importCount] = await connection.execute('SELECT COUNT(*) as count FROM import_history');
        console.log(`📁 Import records: ${importCount[0].count}`);
        
        await connection.end();
        
        console.log('\n🎉 Online database setup completed successfully!');
        console.log('🌐 Database ready for production use!');
        
        console.log('\n📋 Connection Details:');
        console.log('Host:', config.host);
        console.log('Database:', config.database);
        console.log('User:', config.user);
        console.log('\n🔑 Login Details:');
        console.log('Username: admin');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    }
}

setupOnlineDatabase();