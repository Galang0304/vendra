// Database Setup Script for Vendra CRM
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔗 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server');
        
        // Read and execute create database script
        console.log('📄 Reading create-database-simple.sql...');
        const createDbScript = fs.readFileSync(
            path.join(__dirname, 'create-database-simple.sql'), 
            'utf8'
        );
        
        console.log('🗃️ Creating database and tables...');
        
        // Execute statements one by one
        const statements = createDbScript
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }
        console.log('✅ Database and tables created successfully');
        
        // Read and execute insert data script
        console.log('📄 Reading insert-real-data.sql...');
        const insertDataScript = fs.readFileSync(
            path.join(__dirname, 'insert-real-data.sql'), 
            'utf8'
        );
        
        console.log('📊 Inserting real data...');
        
        // Execute insert statements one by one
        const insertStatements = insertDataScript
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
        for (const statement of insertStatements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                } catch (err) {
                    if (!err.message.includes('Duplicate entry')) {
                        console.warn('Warning:', err.message);
                    }
                }
            }
        }
        console.log('✅ Real data inserted successfully');
        
        // Verify data
        console.log('🔍 Verifying data...');
        await connection.execute('USE business_crm');
        
        const [customers] = await connection.execute('SELECT COUNT(*) as count FROM customers');
        const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
        const [transactions] = await connection.execute('SELECT COUNT(*) as count FROM customer_transactions');
        const [revenue] = await connection.execute('SELECT SUM(final_amount) as total FROM customer_transactions WHERE transaction_status = "completed"');
        
        console.log('\n📈 Database Summary:');
        console.log(`👥 Total Customers: ${customers[0].count}`);
        console.log(`📦 Total Products: ${products[0].count}`);
        console.log(`💳 Total Transactions: ${transactions[0].count}`);
        console.log(`💰 Total Revenue: Rp ${(revenue[0].total || 0).toLocaleString('id-ID')}`);
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('🚀 Your CRM now has real data instead of sample data');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Fix: Check your MySQL credentials');
            console.log('   - Make sure MySQL is running');
            console.log('   - Verify username and password');
            console.log('   - Update DB_USER and DB_PASSWORD in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Fix: MySQL server is not running');
            console.log('   - Start MySQL service');
            console.log('   - Check if MySQL is installed');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Fix: Database does not exist');
            console.log('   - The script will create the database automatically');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run setup
console.log('🚀 Starting Vendra CRM Database Setup...\n');
setupDatabase();
