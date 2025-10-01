const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTables() {
    let connection;
    
    try {
        console.log('🔧 Creating database tables...');
        
        // Connect to database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'business_crm'
        });

        console.log('✅ Connected to database');

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Users table created');

        // Create customer_transactions table
        await connection.execute(`
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
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Customer transactions table created');

        // Insert admin user (password: admin123)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password, full_name, role) 
            VALUES ('admin', 'admin@vendracrm.com', ?, 'Administrator', 'admin')
        `, [hashedPassword]);
        
        console.log('✅ Admin user created (username: admin, password: admin123)');

        // Insert sample transaction data
        const sampleTransactions = [
            ['CUST001', '2024-01-15 10:30:00', 'Budi Santoso', 'budi@email.com', '+62-811-1111-1111', 'Electronics', 'Laptop Gaming', 1, 8500000, 8500000, 'credit_card', 'completed'],
            ['CUST002', '2024-01-15 14:20:00', 'Sari Dewi', 'sari@email.com', '+62-812-2222-2222', 'Fashion', 'Jam Tangan', 1, 2500000, 2500000, 'bank_transfer', 'completed'],
            ['CUST003', '2024-01-14 09:15:00', 'Ahmad Rahman', 'ahmad@email.com', '+62-813-3333-3333', 'Electronics', 'Smartphone', 1, 4500000, 4500000, 'credit_card', 'completed'],
            ['CUST004', '2024-01-14 16:45:00', 'Maya Putri', 'maya@email.com', '+62-814-4444-4444', 'Fashion', 'Tas Kulit', 1, 1200000, 1200000, 'e_wallet', 'completed'],
            ['CUST005', '2024-01-13 11:30:00', 'Dedi Gunawan', 'dedi@email.com', '+62-815-5555-5555', 'Electronics', 'Headphone', 1, 850000, 850000, 'cash', 'completed'],
            ['CUST001', '2024-01-12 13:20:00', 'Budi Santoso', 'budi@email.com', '+62-811-1111-1111', 'Books', 'Novel Programming', 1, 150000, 150000, 'cash', 'completed'],
            ['CUST006', '2024-01-12 15:10:00', 'Rina Sari', 'rina@email.com', '+62-816-6666-6666', 'Fashion', 'Sepatu Sport', 1, 750000, 750000, 'debit_card', 'completed'],
            ['CUST002', '2024-01-11 10:45:00', 'Sari Dewi', 'sari@email.com', '+62-812-2222-2222', 'Electronics', 'Mouse Gaming', 1, 350000, 350000, 'credit_card', 'completed'],
            ['CUST007', '2024-01-10 14:30:00', 'Indra Wijaya', 'indra@email.com', '+62-817-7777-7777', 'Electronics', 'Keyboard Mechanical', 1, 1200000, 1200000, 'bank_transfer', 'completed'],
            ['CUST008', '2024-01-09 16:15:00', 'Lina Permata', 'lina@email.com', '+62-818-8888-8888', 'Fashion', 'Dress Casual', 2, 400000, 800000, 'e_wallet', 'completed']
        ];

        for (const transaction of sampleTransactions) {
            await connection.execute(`
                INSERT INTO customer_transactions 
                (unique_customer_id, transaction_date, customer_name, customer_email, customer_phone, product_type, product_name, quantity, unit_price, total_amount, payment_method, transaction_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, transaction);
        }
        
        console.log('✅ Sample transaction data inserted');
        
        // Show summary
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [transactionCount] = await connection.execute('SELECT COUNT(*) as count FROM customer_transactions');
        const [totalRevenue] = await connection.execute('SELECT SUM(total_amount) as total FROM customer_transactions WHERE transaction_status = "completed"');
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - Users: ${userCount[0].count}`);
        console.log(`   - Transactions: ${transactionCount[0].count}`);
        console.log(`   - Total Revenue: Rp ${new Intl.NumberFormat('id-ID').format(totalRevenue[0].total)}`);
        console.log('\n🔐 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTables();