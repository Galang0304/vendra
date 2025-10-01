const mysql = require('mysql2/promise');
require('dotenv').config();

async function simpleSetup() {
    let connection;
    
    try {
        console.log('🔧 Setting up Business CRM Database...\n');
        
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        // Create database
        const dbName = process.env.DB_NAME || 'business_crm';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
        console.log('✅ Database created and selected');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create customer_transactions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS customer_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                unique_customer_id VARCHAR(50) NOT NULL,
                transaction_date DATETIME NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(100),
                customer_phone VARCHAR(20),
                product_type VARCHAR(100) NOT NULL,
                product_name VARCHAR(200),
                quantity INT DEFAULT 1,
                unit_price DECIMAL(15,2) NOT NULL,
                total_amount DECIMAL(15,2) NOT NULL,
                payment_method ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet') DEFAULT 'cash',
                transaction_status ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Customer transactions table created');

        console.log('\n🎉 Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Setup error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

simpleSetup();
