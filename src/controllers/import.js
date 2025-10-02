const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { pool } = require('../utils/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `import_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Import customer transactions from CSV
router.post('/customer-transactions', upload.single('csvFile'), async (req, res) => {
    try {
        console.log('=== IMPORT STARTED ===');
        console.log('File received:', req.file ? req.file.originalname : 'None');
        console.log('File size:', req.file ? req.file.size : 'N/A');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No CSV file uploaded'
            });
        }

        // Check file size
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }

        const filePath = req.file.path;
        console.log('File path:', filePath);
        const results = [];
        const errors = [];
        let processedCount = 0;
        let successCount = 0;

        // Read and parse CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', async () => {
                try {
                    console.log('Total rows to process:', results.length);
                    
                    // Process each row
                    for (const [index, row] of results.entries()) {
                        processedCount++;
                        console.log(`Processing row ${index + 1}:`, row);
                        
                        try {
                            // Validate required fields based on actual database structure
                            const requiredFields = ['customer_name'];
                            
                            const missingFields = requiredFields.filter(field => !row[field]);
                            if (missingFields.length > 0) {
                                console.log(`Row ${index + 2} missing fields:`, missingFields);
                                errors.push({
                                    row: index + 2, // +2 because CSV header is row 1, and array is 0-indexed
                                    error: `Missing required fields: ${missingFields.join(', ')}`
                                });
                                continue;
                            }

                            // Insert transaction with correct database structure
                            console.log('Inserting transaction for:', row.customer_name);
                            const result = await pool.execute(`
                                INSERT INTO customer_transactions 
                                (customer_name, email, phone, product_type, purchase_amount, 
                                 purchase_date, payment_method, sales_rep, customer_segment) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, [
                                row.customer_name,
                                row.email || null,
                                row.phone || null,
                                row.product_type || null,
                                parseFloat(row.purchase_amount) || 0,
                                row.purchase_date || null,
                                row.payment_method || null,
                                row.sales_rep || null,
                                row.customer_segment || null
                            ]);
                            console.log('Insert successful, insertId:', result[0].insertId);

                            successCount++;
                        } catch (error) {
                            console.error(`Error processing row ${index + 2}:`, error.message);
                            errors.push({
                                row: index + 2,
                                error: error.message
                            });
                        }
                    }

                    // Record import history with correct database structure
                    await pool.execute(`
                        INSERT INTO import_history 
                        (original_filename, total_rows, successful_rows, failed_rows, status, import_date, file_size) 
                        VALUES (?, ?, ?, ?, ?, NOW(), ?)
                    `, [
                        req.file.originalname,
                        processedCount,
                        successCount,
                        errors.length,
                        errors.length === 0 ? 'completed' : 'failed',
                        req.file.size || 0
                    ]);

                    // Clean up uploaded file
                    fs.unlinkSync(filePath);

                    // Send response
                    res.json({
                        success: true,
                        message: 'CSV import completed',
                        data: {
                            total_rows: processedCount,
                            successful_imports: successCount,
                            failed_imports: errors.length,
                            errors: errors.slice(0, 10) // Limit error details to first 10
                        }
                    });

                } catch (error) {
                    console.error('CSV processing error:', error);
                    
                    // Clean up uploaded file
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    
                    res.status(500).json({
                        success: false,
                        message: 'Error processing CSV file',
                        error: error.message
                    });
                }
            })
            .on('error', (error) => {
                console.error('CSV read error:', error);
                
                // Clean up uploaded file
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                
                res.status(500).json({
                    success: false,
                    message: 'Error reading CSV file',
                    error: error.message
                });
            });

    } catch (error) {
        console.error('Import error:', error);
        
        // Handle specific multer errors
        let errorMessage = error.message;
        let statusCode = 500;
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File too large. Maximum size is 10MB.';
            statusCode = 400;
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            errorMessage = 'Unexpected file field. Please select a CSV file.';
            statusCode = 400;
        } else if (error.message.includes('Only CSV files are allowed')) {
            errorMessage = 'Only CSV files are allowed. Please select a .csv file.';
            statusCode = 400;
        } else if (error.message.includes('ENOENT')) {
            errorMessage = 'File not found. Please try uploading again.';
        } else if (error.message.includes('ECONNRESET')) {
            errorMessage = 'Connection was reset. Please try with a smaller file.';
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
});

// Download CSV template (hanya customer-transactions)
router.get('/template/customer-transactions', (req, res) => {
    // Header dengan keterangan yang jelas
    const headers = [
        'customer_name', 
        'email', 
        'phone',
        'product_type', 
        'purchase_amount', 
        'purchase_date', 
        'payment_method',
        'sales_rep',
        'customer_segment'
    ];    // Baris keterangan untuk membantu user
        const descriptions = [
        'Nama Lengkap Customer', 
        'Email Valid', 
        'No HP (08xxx)', 
        'Kategori Produk', 
        'Total Pembelian (angka)', 
        'Tanggal (YYYY-MM-DD)', 
        'Metode Bayar',
        'Nama Sales Rep',
        'Segmen Customer'
    ];
    
    // Data contoh yang mudah dipahami dan diikuti
    const sampleData = [
        ['Ahmad Rizki', 'ahmad.rizki@email.com', '081234567890', 'Electronics', '12000000', '2024-10-01', 'Credit Card', 'John Doe', 'Premium'],
        ['Siti Nurhaliza', 'siti.nurhaliza@email.com', '081987654321', 'Fashion', '1750000', '2024-10-01', 'Bank Transfer', 'Jane Smith', 'Regular'],
        ['Budi Santoso', 'budi.santoso@email.com', '081555123456', 'Food & Beverage', '850000', '2024-10-02', 'Cash', 'Mike Johnson', 'Regular'],
        ['', '', '', '', '', '', '', '', ''], // Baris kosong - isi data Anda di sini
        ['', '', '', '', '', '', '', '', ''], // Baris kosong - isi data Anda di sini
        ['', '', '', '', '', '', '', '', ''], // Baris kosong - isi data Anda di sini
        ['', '', '', '', '', '', '', '', ''], // Baris kosong - isi data Anda di sini
        ['', '', '', '', '', '', '', '', '']  // Baris kosong - isi data Anda di sini
    ];
    
    // Generate CSV dengan format yang rapih dan user-friendly
    let csvContent = '';
    
    // Add instructional header
    csvContent += '"╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗"\n';
    csvContent += '"║                                                                    TEMPLATE IMPORT DATA CUSTOMER TRANSACTIONS                                                                   ║"\n';
    csvContent += '"╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝"\n';
    csvContent += '""\n';
    csvContent += '"PETUNJUK PENGISIAN:"\n';
    csvContent += '"1. ISI DATA MULAI DARI BARIS SETELAH HEADER (baris dengan kolom: customer_name, email, dll)"\n';
    csvContent += '"2. HAPUS semua baris petunjuk ini sebelum upload file"\n';
    csvContent += '"3. JANGAN UBAH nama kolom header"\n';
    csvContent += '"4. Gunakan format tanggal: YYYY-MM-DD (contoh: 2024-10-01)"\n';
    csvContent += '"5. Purchase amount tanpa tanda titik/koma (contoh: 5000000 bukan 5.000.000)"\n';
    csvContent += '"6. Customer segment: VIP, Premium, Regular"\n';
    csvContent += '""\n';
    csvContent += '"KATEGORI PRODUK yang tersedia:"\n';
    csvContent += '"Electronics, Fashion, Books, Home & Living, Sports, Health & Beauty, Food & Beverage, Automotive"\n';
    csvContent += '"(Anda bisa menambah kategori baru jika diperlukan)"\n';
    csvContent += '""\n';
    csvContent += '"METODE PEMBAYARAN:"\n';
    csvContent += '"cash, credit_card, bank_transfer, e_wallet"\n';
    csvContent += '""\n';
    csvContent += '"═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════"\n';
    csvContent += '"MULAI ISI DATA DARI SINI ↓"\n';
    csvContent += '""\n';
    
    // Add header
    csvContent += headers.join(',') + '\n';
    
    // Add description row (commented)
    csvContent += descriptions.map(desc => `"${desc}"`).join(',') + '\n';
    
    // Add sample data
    sampleData.forEach(row => {
        const escapedRow = row.map(field => {
            const value = field || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += escapedRow.join(',') + '\n';
    });
    
    const filename = 'customer_transactions_template.csv';
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Add BOM for Excel compatibility
    res.send('\uFEFF' + csvContent);
});

// Download CSV template dengan instruksi lengkap
router.get('/template/customer-transactions-guide', (req, res) => {
    const csvContent = `"INSTRUKSI PENGISIAN TEMPLATE CUSTOMER TRANSACTIONS"
"=================================================="
""
"KOLOM WAJIB DIISI:"
"- unique_customer_id: ID unik customer (contoh: CUST001, CUST002, dst)"
"- customer_name: Nama lengkap customer"
"- product_type: Kategori produk (Electronics, Fashion, Books, Home & Living, dll)"
"- total_amount: Total harga (tanpa titik/koma, contoh: 5000000)"
"- transaction_date: Format YYYY-MM-DD HH:MM:SS (contoh: 2024-10-01 10:30:00)"
""
"KOLOM OPSIONAL:"
"- customer_email: Email customer"
"- customer_phone: Nomor HP (dengan +62 atau 08)"
"- product_name: Nama produk spesifik"
"- quantity: Jumlah barang (default: 1)"
"- unit_price: Harga per unit"
"- payment_method: cash, credit_card, bank_transfer, e_wallet"
""
"CONTOH KATEGORI PRODUK:"
"Electronics, Fashion, Books, Home & Living, Sports, Health & Beauty, Automotive, Food & Beverage"
""
"TIPS PENGISIAN:"
"1. Jangan mengubah nama kolom header"
"2. Hapus semua baris instruksi ini sebelum upload"
"3. Isi data dimulai dari baris setelah header"
"4. Untuk text yang mengandung koma, bungkus dengan tanda kutip"
"5. Format tanggal harus konsisten: YYYY-MM-DD HH:MM:SS"
""
"=================================================="
"MULAI ISI DATA DARI BARIS INI KE BAWAH:"
"unique_customer_id,customer_name,customer_email,customer_phone,product_type,product_name,quantity,unit_price,total_amount,transaction_date,payment_method"
"CUST001","Contoh Customer 1","customer1@email.com","081234567890","Electronics","Smartphone Premium","1","5000000","5000000","2024-10-01 10:00:00","credit_card"
"CUST002","Contoh Customer 2","customer2@email.com","081234567891","Fashion","Baju Muslim Wanita","1","250000","250000","2024-10-01 11:00:00","bank_transfer"
"","","","","","","","","","",""`;
    
    const filename = 'customer_transactions_template_with_guide.csv';
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send('\uFEFF' + csvContent);
});

// Get import history
router.get('/history', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        // Get import history from database
        const [history] = await connection.execute(`
            SELECT 
                id,
                original_filename,
                file_type,
                total_records,
                successful_records,
                failed_records,
                status,
                file_size,
                notes,
                DATE_FORMAT(import_date, '%Y-%m-%d %H:%i') as import_date,
                DATE_FORMAT(import_date, '%d %b %Y, %H:%i') as formatted_date
            FROM import_history 
            ORDER BY import_date DESC
            LIMIT 10
        `);
        
        connection.release();
        
        res.json({
            success: true,
            data: history
        });
        
    } catch (error) {
        console.error('Import history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get import history'
        });
    }
});

// Get import detail by ID
router.get('/detail/:id', async (req, res) => {
    try {
        const importId = req.params.id;
        const connection = await pool.getConnection();
        
        // Get import detail
        const [importDetail] = await connection.execute(`
            SELECT 
                id,
                original_filename,
                file_type,
                total_records,
                successful_records,
                failed_records,
                status,
                file_size,
                notes,
                DATE_FORMAT(import_date, '%Y-%m-%d %H:%i:%s') as import_date,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM import_history 
            WHERE id = ?
        `, [importId]);
        
        if (importDetail.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Import record not found'
            });
        }
        
        // Get related transactions for this import (based on date range)
        const importRecord = importDetail[0];
        const [transactions] = await connection.execute(`
            SELECT 
                unique_customer_id,
                customer_name,
                product_type,
                product_name,
                quantity,
                unit_price,
                total_amount,
                payment_method,
                DATE_FORMAT(transaction_date, '%Y-%m-%d %H:%i') as transaction_date
            FROM customer_transactions 
            WHERE DATE(created_at) = DATE(?)
            ORDER BY created_at DESC
            LIMIT ?
        `, [importRecord.created_at, importRecord.successful_records]);
        
        connection.release();
        
        res.json({
            success: true,
            data: {
                import_info: importRecord,
                transactions: transactions
            }
        });
        
    } catch (error) {
        console.error('Import detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get import details'
        });
    }
});

// Download import report
router.get('/report/:id', async (req, res) => {
    try {
        const importId = req.params.id;
        const connection = await pool.getConnection();
        
        // Get import detail
        const [importDetail] = await connection.execute(`
            SELECT * FROM import_history WHERE id = ?
        `, [importId]);
        
        if (importDetail.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Import record not found'
            });
        }
        
        const importRecord = importDetail[0];
        
        // Get related transactions
        const [transactions] = await connection.execute(`
            SELECT 
                unique_customer_id,
                customer_name,
                customer_email,
                customer_phone,
                product_type,
                product_name,
                quantity,
                unit_price,
                total_amount,
                payment_method,
                transaction_date
            FROM customer_transactions 
            WHERE DATE(created_at) = DATE(?)
            ORDER BY created_at ASC
            LIMIT ?
        `, [importRecord.created_at, importRecord.successful_records]);
        
        connection.release();
        
        // Generate CSV report
        const headers = [
            'unique_customer_id', 'customer_name', 'customer_email', 'customer_phone',
            'product_type', 'product_name', 'quantity', 'unit_price', 'total_amount',
            'payment_method', 'transaction_date'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        transactions.forEach(transaction => {
            const row = headers.map(header => {
                const value = transaction[header] || '';
                // Escape commas and quotes in CSV - handle both cases
                if (typeof value === 'string') {
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                }
                return value;
            });
            csvContent += row.join(',') + '\n';
        });
        
        const filename = `import_report_${importRecord.original_filename}_${new Date().toISOString().split('T')[0]}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Add BOM for Excel compatibility
        res.send('\uFEFF' + csvContent);
        
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report'
        });
    }
});

// Delete import record and related transactions
router.delete('/delete/:id', async (req, res) => {
    try {
        const importId = req.params.id;
        const connection = await pool.getConnection();
        
        // Begin transaction
        await connection.beginTransaction();
        
        try {
            // Get import detail first
            const [importDetail] = await connection.execute(`
                SELECT * FROM import_history WHERE id = ?
            `, [importId]);
            
            if (importDetail.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'Import record not found'
                });
            }
            
            const importRecord = importDetail[0];
            
            // Delete related transactions (based on created date)
            const [deleteResult] = await connection.execute(`
                DELETE FROM customer_transactions 
                WHERE DATE(created_at) = DATE(?)
                LIMIT ?
            `, [importRecord.created_at, importRecord.successful_records]);
            
            // Delete import history record
            await connection.execute(`
                DELETE FROM import_history WHERE id = ?
            `, [importId]);
            
            // Commit transaction
            await connection.commit();
            connection.release();
            
            res.json({
                success: true,
                message: `Import deleted successfully. Removed ${deleteResult.affectedRows} transactions.`,
                data: {
                    deleted_transactions: deleteResult.affectedRows,
                    import_filename: importRecord.original_filename
                }
            });
            
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('Delete import error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete import record'
        });
    }
});

module.exports = router;
