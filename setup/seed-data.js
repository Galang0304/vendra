const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedData() {
    let connection;
    
    try {
        console.log('🌱 Seeding sample data...\n');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'business_crm'
        });

        console.log('✅ Connected to database');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password, full_name, role, phone) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['admin', 'admin@businesscrm.com', hashedPassword, 'System Administrator', 'admin', '+62-812-3456-7890']);
        console.log('✅ Admin user created');

        // Insert sample products
        const products = [
            ['ELEC001', 'Laptop Gaming Premium', 'Electronics', 'High-performance gaming laptop', 15000000, 12000000, 25],
            ['ELEC002', 'Smartphone Flagship', 'Electronics', 'Latest flagship smartphone', 8500000, 7000000, 50],
            ['ELEC003', 'Wireless Headphones', 'Electronics', 'Premium wireless headphones', 1200000, 900000, 100],
            ['FASH001', 'Designer Jacket', 'Fashion', 'Premium designer jacket', 2500000, 1800000, 30],
            ['FASH002', 'Luxury Watch', 'Fashion', 'Swiss luxury watch', 12000000, 9000000, 15],
            ['HOME001', 'Smart TV 55 inch', 'Home & Living', '4K Smart TV with streaming', 6500000, 5200000, 40],
            ['HOME002', 'Coffee Machine', 'Home & Living', 'Automatic espresso machine', 3200000, 2500000, 20],
            ['BOOK001', 'Business Strategy Guide', 'Books', 'Comprehensive business guide', 250000, 150000, 200],
            ['SPRT001', 'Running Shoes Premium', 'Sports', 'Professional running shoes', 1800000, 1200000, 75],
            ['SPRT002', 'Fitness Equipment Set', 'Sports', 'Complete home fitness set', 4500000, 3500000, 10]
        ];

        for (const product of products) {
            await connection.execute(`
                INSERT IGNORE INTO products 
                (product_code, product_name, product_type, description, price, cost, stock_quantity) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, product);
        }
        console.log('✅ Sample products inserted');

        // Insert sample customers
        const customers = [
            ['CUST001', 'Budi Santoso', 'budi.santoso@email.com', '+62-811-1111-1111', 'Jl. Sudirman No. 123, Jakarta', 'Jakarta', '10110', 'male', 'premium'],
            ['CUST002', 'Sari Dewi', 'sari.dewi@email.com', '+62-812-2222-2222', 'Jl. Thamrin No. 456, Jakarta', 'Jakarta', '10230', 'female', 'vip'],
            ['CUST003', 'Ahmad Rahman', 'ahmad.rahman@email.com', '+62-813-3333-3333', 'Jl. Gatot Subroto No. 789, Jakarta', 'Jakarta', '12950', 'male', 'regular'],
            ['CUST004', 'Maya Putri', 'maya.putri@email.com', '+62-814-4444-4444', 'Jl. Kuningan No. 321, Jakarta', 'Jakarta', '12940', 'female', 'premium'],
            ['CUST005', 'Rizki Pratama', 'rizki.pratama@email.com', '+62-815-5555-5555', 'Jl. Senayan No. 654, Jakarta', 'Jakarta', '10270', 'male', 'regular'],
            ['CUST006', 'Linda Sari', 'linda.sari@email.com', '+62-816-6666-6666', 'Jl. Kemang No. 987, Jakarta', 'Jakarta', '12560', 'female', 'vip'],
            ['CUST007', 'Doni Wijaya', 'doni.wijaya@email.com', '+62-817-7777-7777', 'Jl. Pondok Indah No. 147, Jakarta', 'Jakarta', '12310', 'male', 'premium'],
            ['CUST008', 'Fitri Handayani', 'fitri.handayani@email.com', '+62-818-8888-8888', 'Jl. Menteng No. 258, Jakarta', 'Jakarta', '10310', 'female', 'regular'],
            ['CUST009', 'Eko Susanto', 'eko.susanto@email.com', '+62-819-9999-9999', 'Jl. Cikini No. 369, Jakarta', 'Jakarta', '10330', 'male', 'premium'],
            ['CUST010', 'Dewi Lestari', 'dewi.lestari@email.com', '+62-821-1010-1010', 'Jl. Blok M No. 741, Jakarta', 'Jakarta', '12120', 'female', 'vip']
        ];

        for (const customer of customers) {
            await connection.execute(`
                INSERT IGNORE INTO customers 
                (unique_customer_id, customer_name, customer_email, customer_phone, address, city, postal_code, gender, customer_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, customer);
        }
        console.log('✅ Sample customers inserted');

        // Insert sample transactions
        const transactions = [
            ['CUST001', '2024-01-15 10:30:00', 'Budi Santoso', 'budi.santoso@email.com', '+62-811-1111-1111', 'Electronics', 'Laptop Gaming Premium', 1, 15000000, 15000000, 'credit_card'],
            ['CUST002', '2024-01-15 14:20:00', 'Sari Dewi', 'sari.dewi@email.com', '+62-812-2222-2222', 'Fashion', 'Luxury Watch', 1, 12000000, 12000000, 'bank_transfer'],
            ['CUST003', '2024-01-14 09:15:00', 'Ahmad Rahman', 'ahmad.rahman@email.com', '+62-813-3333-3333', 'Electronics', 'Smartphone Flagship', 1, 8500000, 8500000, 'credit_card'],
            ['CUST004', '2024-01-14 16:45:00', 'Maya Putri', 'maya.putri@email.com', '+62-814-4444-4444', 'Fashion', 'Designer Jacket', 1, 2500000, 2500000, 'debit_card'],
            ['CUST005', '2024-01-13 11:30:00', 'Rizki Pratama', 'rizki.pratama@email.com', '+62-815-5555-5555', 'Books', 'Business Strategy Guide', 2, 250000, 500000, 'cash'],
            ['CUST001', '2024-01-12 13:20:00', 'Budi Santoso', 'budi.santoso@email.com', '+62-811-1111-1111', 'Electronics', 'Wireless Headphones', 1, 1200000, 1200000, 'credit_card'],
            ['CUST006', '2024-01-12 15:10:00', 'Linda Sari', 'linda.sari@email.com', '+62-816-6666-6666', 'Home & Living', 'Smart TV 55 inch', 1, 6500000, 6500000, 'bank_transfer'],
            ['CUST007', '2024-01-11 10:45:00', 'Doni Wijaya', 'doni.wijaya@email.com', '+62-817-7777-7777', 'Sports', 'Running Shoes Premium', 1, 1800000, 1800000, 'e_wallet'],
            ['CUST008', '2024-01-11 12:30:00', 'Fitri Handayani', 'fitri.handayani@email.com', '+62-818-8888-8888', 'Home & Living', 'Coffee Machine', 1, 3200000, 3200000, 'credit_card'],
            ['CUST009', '2024-01-10 14:15:00', 'Eko Susanto', 'eko.susanto@email.com', '+62-819-9999-9999', 'Sports', 'Fitness Equipment Set', 1, 4500000, 4500000, 'bank_transfer'],
            ['CUST010', '2024-01-10 16:00:00', 'Dewi Lestari', 'dewi.lestari@email.com', '+62-821-1010-1010', 'Fashion', 'Designer Jacket', 2, 2500000, 5000000, 'credit_card'],
            ['CUST002', '2024-01-09 09:30:00', 'Sari Dewi', 'sari.dewi@email.com', '+62-812-2222-2222', 'Electronics', 'Smartphone Flagship', 1, 8500000, 8500000, 'bank_transfer'],
            ['CUST003', '2024-01-09 11:45:00', 'Ahmad Rahman', 'ahmad.rahman@email.com', '+62-813-3333-3333', 'Books', 'Business Strategy Guide', 1, 250000, 250000, 'cash'],
            ['CUST004', '2024-01-08 13:15:00', 'Maya Putri', 'maya.putri@email.com', '+62-814-4444-4444', 'Electronics', 'Wireless Headphones', 2, 1200000, 2400000, 'debit_card'],
            ['CUST005', '2024-01-08 15:30:00', 'Rizki Pratama', 'rizki.pratama@email.com', '+62-815-5555-5555', 'Home & Living', 'Coffee Machine', 1, 3200000, 3200000, 'e_wallet']
        ];

        for (const transaction of transactions) {
            await connection.execute(`
                INSERT INTO customer_transactions 
                (unique_customer_id, transaction_date, customer_name, customer_email, customer_phone, 
                 product_type, product_name, quantity, unit_price, total_amount, payment_method) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, transaction);
        }
        console.log('✅ Sample transactions inserted');

        // Update customer statistics
        await connection.execute(`
            UPDATE customers c SET 
                total_transactions = (
                    SELECT COUNT(*) FROM customer_transactions ct 
                    WHERE ct.unique_customer_id = c.unique_customer_id 
                    AND ct.transaction_status = 'completed'
                ),
                total_spent = (
                    SELECT COALESCE(SUM(total_amount), 0) FROM customer_transactions ct 
                    WHERE ct.unique_customer_id = c.unique_customer_id 
                    AND ct.transaction_status = 'completed'
                ),
                last_transaction_date = (
                    SELECT MAX(transaction_date) FROM customer_transactions ct 
                    WHERE ct.unique_customer_id = c.unique_customer_id 
                    AND ct.transaction_status = 'completed'
                )
        `);
        console.log('✅ Customer statistics updated');

        console.log('\n🎉 Sample data seeding completed!');
        console.log('📊 Data inserted:');
        console.log('   - 1 Admin user (admin/admin123)');
        console.log('   - 10 Products');
        console.log('   - 10 Customers');
        console.log('   - 15 Transactions');

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run seeding
if (require.main === module) {
    seedData();
}

module.exports = { seedData };
