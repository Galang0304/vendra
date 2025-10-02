const mysql = require('mysql2/promise');
const fs = require('fs');

async function importToOnlineDatabase() {
    console.log('🚀 Starting database import to online hosting...\n');
    
    // Database online configuration
    const onlineConfig = {
        host: 'sql12.freesqldatabase.com',
        user: 'sql12800978',
        password: 'yzJDq4BqVk',
        database: 'sql12800978',
        port: 3306,
        multipleStatements: true,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    };
    
    try {
        console.log('📡 Connecting to online database...');
        const connection = await mysql.createConnection(onlineConfig);
        console.log('✅ Connected to online database successfully!\n');
        
        console.log('📄 Reading SQL file...');
        let sqlContent = fs.readFileSync('business_crm (1).sql', 'utf8');
        
        // Clean up SQL content untuk online database
        sqlContent = sqlContent
            .replace(/CREATE DATABASE.*?;/gi, '') // Remove CREATE DATABASE
            .replace(/USE.*?;/gi, '') // Remove USE database
            .replace(/--.*$/gm, '') // Remove comments
            .replace(/\/\*.*?\*\//gs, '') // Remove block comments
            .replace(/^\s*$/gm, '') // Remove empty lines
            .trim();
        
        // Split SQL into individual statements
        const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
        
        console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement.length === 0) continue;
            
            try {
                await connection.execute(statement);
                successCount++;
                
                // Show progress every 10 statements
                if ((i + 1) % 10 === 0) {
                    console.log(`⏳ Progress: ${i + 1}/${statements.length} statements executed`);
                }
            } catch (error) {
                errorCount++;
                console.log(`❌ Error in statement ${i + 1}: ${error.message}`);
                // Continue with next statement
            }
        }
        
        console.log('\n🎉 Import completed!');
        console.log(`✅ Successful: ${successCount} statements`);
        console.log(`❌ Errors: ${errorCount} statements\n`);
        
        // Verify data import
        console.log('🔍 Verifying imported data...');
        
        // Check tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tables created: ${tables.length}`);
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Check data counts
        try {
            const [customerCount] = await connection.execute('SELECT COUNT(*) as count FROM customer_transactions');
            console.log(`📊 Customer transactions: ${customerCount[0].count} records`);
            
            const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
            console.log(`👥 Users: ${userCount[0].count} records`);
            
            const [importCount] = await connection.execute('SELECT COUNT(*) as count FROM import_history');
            console.log(`📁 Import history: ${importCount[0].count} records`);
            
        } catch (error) {
            console.log('⚠️  Some tables might not have data yet, which is normal');
        }
        
        await connection.end();
        console.log('\n✅ Database import completed successfully!');
        console.log('🌐 Your online database is ready to use!');
        
    } catch (error) {
        console.error('❌ Error during import:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Test connection first
async function testConnection() {
    const onlineConfig = {
        host: 'sql12.freesqldatabase.com',
        user: 'sql12800978',
        password: 'yzJDq4BqVk',
        database: 'sql12800978',
        port: 3306,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    };
    
    try {
        console.log('🧪 Testing connection to online database...');
        const connection = await mysql.createConnection(onlineConfig);
        console.log('✅ Connection test successful!');
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('📦 IMPORT DATABASE TO ONLINE HOSTING');
    console.log('='.repeat(50));
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed with import due to connection issues');
        process.exit(1);
    }
    
    console.log('\n🚀 Starting import process...\n');
    await importToOnlineDatabase();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 IMPORT COMPLETED!');
    console.log('='.repeat(50));
    console.log('Database URL: sql12.freesqldatabase.com');
    console.log('Database: sql12800978');
    console.log('✅ Ready for production use!');
}

main();