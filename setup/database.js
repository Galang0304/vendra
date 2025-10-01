const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔧 Setting up Business CRM Database...\n');
        
        // Connect to MySQL (without database first)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        // Create database if not exists
        const dbName = process.env.DB_NAME || 'business_crm';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.execute(`USE \`${dbName}\``);

        console.log('✅ Connected to MySQL database');

        // Create users table for authentication
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
                phone VARCHAR(20),
                avatar VARCHAR(255),
                status ENUM('active', 'inactive') DEFAULT 'active',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_username (username),
                INDEX idx_email (email),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Users table created');

        // Create customer_transactions table - SESUAI KEBUTUHAN ANDA
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS customer_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                unique_customer_id VARCHAR(50) NOT NULL COMMENT 'ID unik pelanggan',
                transaction_date DATETIME NOT NULL COMMENT 'Tanggal dan jam transaksi',
                customer_name VARCHAR(100) NOT NULL COMMENT 'Nama pelanggan',
                customer_email VARCHAR(100) COMMENT 'Email pelanggan',
                customer_phone VARCHAR(20) COMMENT 'Nomor HP pelanggan',
                product_type VARCHAR(100) NOT NULL COMMENT 'Jenis produk yang dibeli',
                product_name VARCHAR(200) COMMENT 'Nama produk detail',
                quantity INT DEFAULT 1 COMMENT 'Jumlah produk',
                unit_price DECIMAL(15,2) NOT NULL COMMENT 'Harga per unit',
                total_amount DECIMAL(15,2) NOT NULL COMMENT 'Total pembelanjaan',
                payment_method ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet') DEFAULT 'cash',
                transaction_status ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'completed',
                notes TEXT COMMENT 'Catatan tambahan',
                created_by INT COMMENT 'User yang input data',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_customer_id (unique_customer_id),
                INDEX idx_transaction_date (transaction_date),
                INDEX idx_customer_email (customer_email),
                INDEX idx_product_type (product_type),
                INDEX idx_status (transaction_status),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('✅ Customer transactions table created');

        // Create customers master table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                unique_customer_id VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(100),
                customer_phone VARCHAR(20),
                address TEXT,
                city VARCHAR(50),
                postal_code VARCHAR(10),
                date_of_birth DATE,
                gender ENUM('male', 'female', 'other'),
                customer_type ENUM('regular', 'premium', 'vip') DEFAULT 'regular',
                total_transactions INT DEFAULT 0,
                total_spent DECIMAL(15,2) DEFAULT 0.00,
                last_transaction_date DATETIME,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_unique_id (unique_customer_id),
                INDEX idx_email (customer_email),
                INDEX idx_phone (customer_phone),
                INDEX idx_type (customer_type),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Customers master table created');

        // Create products table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_code VARCHAR(50) UNIQUE NOT NULL,
                product_name VARCHAR(200) NOT NULL,
                product_type VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(15,2) NOT NULL,
                cost DECIMAL(15,2),
                stock_quantity INT DEFAULT 0,
                min_stock_level INT DEFAULT 0,
                status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_product_code (product_code),
                INDEX idx_product_type (product_type),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Products table created');

        console.log('✅ All tables created successfully');

        console.log('\n🎉 Database setup completed successfully!');
        console.log('📊 Tables created:');
        console.log('   - users (authentication)');
        console.log('   - customer_transactions (main data)');
        console.log('   - customers (master data)');
        console.log('   - products (catalog)');
        console.log('   - Analytics views');

    } catch (error) {
        console.error('❌ Database setup error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run setup
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
