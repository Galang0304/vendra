// Create Import History Table and Add Sample Data
const mysql = require('mysql2/promise');

async function createImportHistoryTable() {
    try {
        console.log('🗃️ CREATING IMPORT HISTORY TABLE...\n');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'business_crm'
        });
        
        // Create import_history table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS import_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                original_filename VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) DEFAULT 'customer-transactions',
                total_records INT DEFAULT 0,
                successful_records INT DEFAULT 0,
                failed_records INT DEFAULT 0,
                status ENUM('processing', 'completed', 'failed', 'partial') DEFAULT 'processing',
                import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_size INT DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Import history table created');
        
        // Add sample import history records
        const sampleImports = [
            {
                filename: 'import_' + Date.now() + '_initial_data.csv',
                original_filename: 'initial_customer_data.csv',
                file_type: 'customer-transactions',
                total_records: 10,
                successful_records: 10,
                failed_records: 0,
                status: 'completed',
                file_size: 2048,
                notes: 'Initial data setup - 10 customer transactions imported successfully'
            },
            {
                filename: 'import_' + (Date.now() - 86400000) + '_customer_batch.csv',
                original_filename: 'customer_batch_001.csv', 
                file_type: 'customer-transactions',
                total_records: 25,
                successful_records: 23,
                failed_records: 2,
                status: 'partial',
                file_size: 4096,
                notes: '2 records failed due to duplicate customer IDs'
            }
        ];
        
        for (const importRecord of sampleImports) {
            await connection.execute(`
                INSERT INTO import_history 
                (filename, original_filename, file_type, total_records, successful_records, failed_records, status, file_size, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                importRecord.filename,
                importRecord.original_filename,
                importRecord.file_type,
                importRecord.total_records,
                importRecord.successful_records,
                importRecord.failed_records,
                importRecord.status,
                importRecord.file_size,
                importRecord.notes
            ]);
        }
        
        console.log('✅ Sample import history records added');
        
        // Show current import history
        const [records] = await connection.execute(`
            SELECT 
                original_filename,
                file_type,
                total_records,
                successful_records,
                failed_records,
                status,
                DATE_FORMAT(import_date, '%Y-%m-%d %H:%i') as import_date
            FROM import_history 
            ORDER BY import_date DESC
        `);
        
        console.log('\n📊 IMPORT HISTORY RECORDS:');
        records.forEach((record, i) => {
            console.log(`${i+1}. ${record.original_filename}`);
            console.log(`   - Type: ${record.file_type}`);
            console.log(`   - Records: ${record.successful_records}/${record.total_records} successful`);
            console.log(`   - Status: ${record.status}`);
            console.log(`   - Date: ${record.import_date}`);
            console.log('');
        });
        
        console.log('🚀 Import history table ready for Recent Imports feature!');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createImportHistoryTable();