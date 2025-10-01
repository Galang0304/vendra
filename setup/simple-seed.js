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
        await connection.query(`
            INSERT IGNORE INTO users (username, email, password, full_name, role, phone) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['admin', 'admin@businesscrm.com', hashedPassword, 'System Administrator', 'admin', '+62-812-3456-7890']);
        console.log('✅ Admin user created');

        // Insert sample transactions - NOMINAL REALISTIS
        const transactions = [
            ['CUST001', '2024-01-15 10:30:00', 'Budi Santoso', 'budi.santoso@email.com', '+62-811-1111-1111', 'Electronics', 'Laptop Gaming', 1, 8500000, 8500000, 'credit_card'],
            ['CUST002', '2024-01-15 14:20:00', 'Sari Dewi', 'sari.dewi@email.com', '+62-812-2222-2222', 'Fashion', 'Jam Tangan', 1, 2500000, 2500000, 'bank_transfer'],
            ['CUST003', '2024-01-14 09:15:00', 'Ahmad Rahman', 'ahmad.rahman@email.com', '+62-813-3333-3333', 'Electronics', 'Smartphone', 1, 4500000, 4500000, 'credit_card'],
            ['CUST004', '2024-01-14 16:45:00', 'Maya Putri', 'maya.putri@email.com', '+62-814-4444-4444', 'Fashion', 'Jaket Premium', 1, 850000, 850000, 'debit_card'],
            ['CUST005', '2024-01-13 11:30:00', 'Rizki Pratama', 'rizki.pratama@email.com', '+62-815-5555-5555', 'Books', 'Buku Bisnis', 2, 125000, 250000, 'cash'],
            ['CUST001', '2024-01-12 13:20:00', 'Budi Santoso', 'budi.santoso@email.com', '+62-811-1111-1111', 'Electronics', 'Headphone Wireless', 1, 750000, 750000, 'credit_card'],
            ['CUST006', '2024-01-12 15:10:00', 'Linda Sari', 'linda.sari@email.com', '+62-816-6666-6666', 'Home & Living', 'Smart TV 43 inch', 1, 3200000, 3200000, 'bank_transfer'],
            ['CUST007', '2024-01-11 10:45:00', 'Doni Wijaya', 'doni.wijaya@email.com', '+62-817-7777-7777', 'Sports', 'Sepatu Lari', 1, 950000, 950000, 'e_wallet'],
            ['CUST008', '2024-01-11 12:30:00', 'Fitri Handayani', 'fitri.handayani@email.com', '+62-818-8888-8888', 'Home & Living', 'Mesin Kopi', 1, 1800000, 1800000, 'credit_card'],
            ['CUST009', '2024-01-10 14:15:00', 'Eko Susanto', 'eko.susanto@email.com', '+62-819-9999-9999', 'Sports', 'Alat Fitness', 1, 2200000, 2200000, 'bank_transfer'],
            ['CUST010', '2024-01-10 16:00:00', 'Dewi Lestari', 'dewi.lestari@email.com', '+62-821-1010-1010', 'Fashion', 'Tas Kulit', 1, 1200000, 1200000, 'credit_card'],
            ['CUST002', '2024-01-09 09:30:00', 'Sari Dewi', 'sari.dewi@email.com', '+62-812-2222-2222', 'Electronics', 'Tablet', 1, 3500000, 3500000, 'bank_transfer'],
            ['CUST003', '2024-01-09 11:45:00', 'Ahmad Rahman', 'ahmad.rahman@email.com', '+62-813-3333-3333', 'Books', 'Novel', 3, 85000, 255000, 'cash'],
            ['CUST004', '2024-01-08 13:15:00', 'Maya Putri', 'maya.putri@email.com', '+62-814-4444-4444', 'Electronics', 'Earbuds', 1, 450000, 450000, 'debit_card'],
            ['CUST005', '2024-01-08 15:30:00', 'Rizki Pratama', 'rizki.pratama@email.com', '+62-815-5555-5555', 'Home & Living', 'Blender', 1, 650000, 650000, 'e_wallet'],
            ['CUST011', '2024-01-07 10:00:00', 'Andi Setiawan', 'andi.setiawan@email.com', '+62-822-1111-2222', 'Electronics', 'Monitor Gaming', 1, 2800000, 2800000, 'credit_card'],
            ['CUST012', '2024-01-07 14:30:00', 'Rina Sari', 'rina.sari@email.com', '+62-823-3333-4444', 'Fashion', 'Handbag', 1, 1500000, 1500000, 'bank_transfer'],
            ['CUST013', '2024-01-06 11:15:00', 'Hendra Kusuma', 'hendra.kusuma@email.com', '+62-824-5555-6666', 'Sports', 'Sepeda Gunung', 1, 4200000, 4200000, 'credit_card'],
            ['CUST014', '2024-01-06 16:20:00', 'Sinta Dewi', 'sinta.dewi@email.com', '+62-825-7777-8888', 'Home & Living', 'Air Purifier', 1, 1400000, 1400000, 'e_wallet'],
            ['CUST015', '2024-01-05 09:45:00', 'Bambang Sutrisno', 'bambang.sutrisno@email.com', '+62-826-9999-0000', 'Electronics', 'Speaker Bluetooth', 2, 350000, 700000, 'debit_card']
        ];

        for (const transaction of transactions) {
            await connection.query(`
                INSERT INTO customer_transactions 
                (unique_customer_id, transaction_date, customer_name, customer_email, customer_phone, 
                 product_type, product_name, quantity, unit_price, total_amount, payment_method) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, transaction);
        }
        console.log('✅ Sample transactions inserted');

        console.log('\n🎉 Sample data seeding completed!');
        console.log('📊 Data inserted:');
        console.log('   - 1 Admin user (admin/admin123)');
        console.log('   - 20 Customer Transactions');
        console.log('   - Data mencakup: ID unik, tanggal/jam, nama/email/HP, jenis produk, total pembelanjaan');

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

seedData();
