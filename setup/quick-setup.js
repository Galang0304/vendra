const mysql = require('mysql2/promise');
require('dotenv').config();

async function quickSetup() {
    let connection;
    
    try {
        console.log('🔧 Quick Database Setup...');
        
        // Connect tanpa database dulu
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS business_crm');
        await connection.execute('USE business_crm');
        
        console.log('✅ Database created');

        // Create simple tables
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS customer_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                unique_customer_id VARCHAR(50),
                transaction_date DATETIME,
                customer_name VARCHAR(100),
                customer_email VARCHAR(100),
                product_type VARCHAR(100),
                product_name VARCHAR(200),
                total_amount DECIMAL(15,2),
                transaction_status VARCHAR(20) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Table created');

        // Insert sample data
        const sampleData = [
            ['CUST001', '2024-01-15 10:30:00', 'Budi Santoso', 'budi@email.com', 'Electronics', 'Laptop Gaming', 8500000],
            ['CUST002', '2024-01-15 14:20:00', 'Sari Dewi', 'sari@email.com', 'Fashion', 'Jam Tangan', 2500000],
            ['CUST003', '2024-01-14 09:15:00', 'Ahmad Rahman', 'ahmad@email.com', 'Electronics', 'Smartphone', 4500000],
            ['CUST004', '2024-01-14 16:45:00', 'Maya Putri', 'maya@email.com', 'Fashion', 'Tas Kulit', 1200000],
            ['CUST005', '2024-01-13 11:30:00', 'Dedi Gunawan', 'dedi@email.com', 'Electronics', 'Headphone', 850000],
            ['CUST001', '2024-01-12 13:20:00', 'Budi Santoso', 'budi@email.com', 'Books', 'Novel', 150000],
            ['CUST006', '2024-01-12 15:10:00', 'Rina Sari', 'rina@email.com', 'Fashion', 'Sepatu', 750000],
            ['CUST002', '2024-01-11 10:45:00', 'Sari Dewi', 'sari@email.com', 'Electronics', 'Mouse Gaming', 350000]
        ];

        for (const data of sampleData) {
            await connection.execute(
                'INSERT INTO customer_transactions (unique_customer_id, transaction_date, customer_name, customer_email, product_type, product_name, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
                data
            );
        }
        
        console.log('✅ Sample data inserted');
        console.log('🎉 Database setup completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

quickSetup();