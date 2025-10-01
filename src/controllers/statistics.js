// Vendra CRM - Statistics Controller
const express = require('express');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const router = express.Router();

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'business_crm'
};

// Get dashboard statistics (with fallback to sample data)
router.get('/dashboard', async (req, res) => {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Test database connection
        await connection.execute('SELECT 1');
        
        // Get basic statistics
        const [totalCustomersResult] = await connection.execute(
            'SELECT COUNT(DISTINCT unique_customer_id) as total FROM customer_transactions WHERE transaction_status = "completed"'
        );
        
        const [totalRevenueResult] = await connection.execute(
            'SELECT SUM(total_amount) as total FROM customer_transactions WHERE transaction_status = "completed"'
        );
        
        const [totalTransactionsResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM customer_transactions WHERE transaction_status = "completed"'
        );
        
        const [avgTransactionResult] = await connection.execute(
            'SELECT AVG(total_amount) as average FROM customer_transactions WHERE transaction_status = "completed"'
        );
        
        // Get monthly revenue data from all available data
        const [monthlyResult] = await connection.execute(`
            SELECT 
                YEAR(transaction_date) as year,
                MONTH(transaction_date) as month,
                COUNT(*) as transaction_count,
                SUM(total_amount) as revenue
            FROM customer_transactions 
            WHERE transaction_status = "completed"
            GROUP BY YEAR(transaction_date), MONTH(transaction_date)
            ORDER BY year, month
        `);
        
        // Get product category breakdown
        const [categoryResult] = await connection.execute(`
            SELECT 
                product_type,
                COUNT(*) as count,
                SUM(total_amount) as revenue
            FROM customer_transactions 
            WHERE transaction_status = "completed"
            GROUP BY product_type
            ORDER BY revenue DESC
        `);
        
        // Get top products
        const [topProductsResult] = await connection.execute(`
            SELECT 
                product_name,
                product_type,
                COUNT(*) as sales_count,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_price
            FROM customer_transactions 
            WHERE transaction_status = "completed"
            GROUP BY product_name, product_type
            ORDER BY total_revenue DESC
            LIMIT 10
        `);
        
        // Get customer segments
        const [customerSegmentsResult] = await connection.execute(`
            SELECT 
                CASE 
                    WHEN total_spent >= 10000000 THEN 'VIP'
                    WHEN total_spent >= 5000000 THEN 'Premium'
                    WHEN total_spent >= 1000000 THEN 'Regular'
                    ELSE 'New'
                END as segment,
                COUNT(*) as customer_count,
                SUM(total_spent) as segment_revenue
            FROM (
                SELECT 
                    unique_customer_id,
                    SUM(total_amount) as total_spent
                FROM customer_transactions 
                WHERE transaction_status = "completed"
                GROUP BY unique_customer_id
            ) as customer_totals
            GROUP BY segment
            ORDER BY segment_revenue DESC
        `);
        
        // Get hourly activity
        const [hourlyActivityResult] = await connection.execute(`
            SELECT 
                HOUR(transaction_date) as hour,
                COUNT(*) as transaction_count
            FROM customer_transactions 
            WHERE transaction_status = "completed"
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY HOUR(transaction_date)
            ORDER BY hour
        `);
        
        // Get recent transactions
        const [recentTransactionsResult] = await connection.execute(`
            SELECT 
                unique_customer_id,
                customer_name,
                customer_email,
                product_name,
                product_type,
                total_amount,
                transaction_date,
                transaction_status
            FROM customer_transactions 
            ORDER BY transaction_date DESC
            LIMIT 20
        `);
        
        // Calculate growth rates
        const [lastMonthRevenueResult] = await connection.execute(`
            SELECT SUM(total_amount) as last_month_revenue
            FROM customer_transactions 
            WHERE transaction_status = "completed"
                AND transaction_date >= DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 MONTH), INTERVAL 1 MONTH)
                AND transaction_date < DATE_SUB(NOW(), INTERVAL 1 MONTH)
        `);
        
        const [thisMonthRevenueResult] = await connection.execute(`
            SELECT SUM(total_amount) as this_month_revenue
            FROM customer_transactions 
            WHERE transaction_status = "completed"
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        `);
        
        // Calculate metrics
        const totalCustomers = totalCustomersResult[0]?.total || 0;
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const totalTransactions = totalTransactionsResult[0]?.total || 0;
        const avgTransaction = avgTransactionResult[0]?.average || 0;
        
        const lastMonthRevenue = lastMonthRevenueResult[0]?.last_month_revenue || 0;
        const thisMonthRevenue = thisMonthRevenueResult[0]?.this_month_revenue || 0;
        const revenueGrowth = lastMonthRevenue > 0 ? 
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
        
        // Format monthly revenue data
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const data = monthlyResult.find(r => r.month === month);
            return {
                month: new Date(2024, i).toLocaleDateString('id-ID', { month: 'short' }),
                revenue: data?.revenue || 0,
                transactions: data?.transaction_count || 0
            };
        });
        
        const statistics = {
            overview: {
                totalCustomers,
                totalRevenue,
                totalTransactions,
                avgTransaction,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100
            },
            monthlyRevenue,
            categories: categoryResult,
            topProducts: topProductsResult,
            customerSegments: customerSegmentsResult,
            hourlyActivity: hourlyActivityResult,
            recentTransactions: recentTransactionsResult
        };
        
        logger.info('Statistics data retrieved', {
            userId: req.user?.id,
            totalCustomers,
            totalRevenue,
            totalTransactions
        });
        
        res.json({
            success: true,
            data: statistics
        });
        
    } catch (error) {
        logger.error('Statistics dashboard error:', error);
        
        // Return sample data as fallback
        const sampleStatistics = {
            overview: {
                totalCustomers: 8,
                totalRevenue: 18550000,
                totalTransactions: 8,
                avgTransaction: 2318750,
                revenueGrowth: 15.2
            },
            monthlyRevenue: [
                { month: 'Jan', revenue: 18550000, transactions: 8 },
                { month: 'Feb', revenue: 15200000, transactions: 6 },
                { month: 'Mar', revenue: 22100000, transactions: 9 },
                { month: 'Apr', revenue: 19800000, transactions: 7 }
            ],
            categories: [
                { product_type: 'Electronics', count: 4, revenue: 14200000 },
                { product_type: 'Fashion', count: 3, revenue: 4200000 },
                { product_type: 'Books', count: 1, revenue: 150000 }
            ],
            topProducts: [
                { product_name: 'Laptop Gaming', product_type: 'Electronics', sales_count: 1, total_revenue: 8500000, avg_price: 8500000 },
                { product_name: 'Smartphone', product_type: 'Electronics', sales_count: 1, total_revenue: 4500000, avg_price: 4500000 },
                { product_name: 'Jam Tangan', product_type: 'Fashion', sales_count: 1, total_revenue: 2500000, avg_price: 2500000 }
            ],
            recentTransactions: [
                { unique_customer_id: 'CUST001', customer_name: 'Budi Santoso', customer_email: 'budi@email.com', product_name: 'Laptop Gaming', product_type: 'Electronics', total_amount: 8500000, transaction_date: '2024-01-15T10:30:00Z', transaction_status: 'completed' },
                { unique_customer_id: 'CUST002', customer_name: 'Sari Dewi', customer_email: 'sari@email.com', product_name: 'Jam Tangan', product_type: 'Fashion', total_amount: 2500000, transaction_date: '2024-01-15T14:20:00Z', transaction_status: 'completed' },
                { unique_customer_id: 'CUST003', customer_name: 'Ahmad Rahman', customer_email: 'ahmad@email.com', product_name: 'Smartphone', product_type: 'Electronics', total_amount: 4500000, transaction_date: '2024-01-14T09:15:00Z', transaction_status: 'completed' },
                { unique_customer_id: 'CUST004', customer_name: 'Maya Putri', customer_email: 'maya@email.com', product_name: 'Tas Kulit', product_type: 'Fashion', total_amount: 1200000, transaction_date: '2024-01-14T16:45:00Z', transaction_status: 'completed' },
                { unique_customer_id: 'CUST005', customer_name: 'Dedi Gunawan', customer_email: 'dedi@email.com', product_name: 'Headphone', product_type: 'Electronics', total_amount: 850000, transaction_date: '2024-01-13T11:30:00Z', transaction_status: 'completed' }
            ]
        };
        
        res.json({
            success: true,
            data: sampleStatistics,
            message: 'Using sample data - Database connection failed: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Get time-range specific statistics (removed auth for demo)
router.get('/range/:days', async (req, res) => {
    let connection;
    
    try {
        const days = parseInt(req.params.days) || 30;
        connection = await mysql.createConnection(dbConfig);
        
        // Get revenue trend for specific period
        const [revenueTrendResult] = await connection.execute(`
            SELECT 
                DATE(transaction_date) as date,
                SUM(total_amount) as revenue,
                COUNT(*) as transactions
            FROM customer_transactions 
            WHERE transaction_status = "completed" 
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(transaction_date)
            ORDER BY date
        `, [days]);
        
        // Get top customers for period
        const [topCustomersResult] = await connection.execute(`
            SELECT 
                unique_customer_id,
                customer_name,
                customer_email,
                COUNT(*) as transaction_count,
                SUM(total_amount) as total_spent
            FROM customer_transactions 
            WHERE transaction_status = "completed"
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY unique_customer_id, customer_name, customer_email
            ORDER BY total_spent DESC
            LIMIT 10
        `, [days]);
        
        res.json({
            success: true,
            data: {
                period: `${days} days`,
                revenueTrend: revenueTrendResult,
                topCustomers: topCustomersResult
            }
        });
        
    } catch (error) {
        logger.error('Error fetching time-range statistics', error, {
            userId: req.user?.id,
            days: req.params.days
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch time-range statistics'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Export statistics data (removed auth for demo)
router.get('/export', async (req, res) => {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const [exportData] = await connection.execute(`
            SELECT 
                unique_customer_id,
                customer_name,
                customer_email,
                customer_phone,
                product_name,
                product_type,
                quantity,
                total_amount,
                transaction_date,
                transaction_status,
                payment_method
            FROM customer_transactions 
            ORDER BY transaction_date DESC
        `);
        
        // Convert to CSV format
        const csvHeaders = [
            'Customer ID', 'Customer Name', 'Email', 'Phone',
            'Product', 'Category', 'Quantity', 'Amount',
            'Date', 'Status', 'Payment Method'
        ];
        
        const csvRows = exportData.map(row => [
            row.unique_customer_id,
            row.customer_name,
            row.customer_email || '',
            row.customer_phone || '',
            row.product_name,
            row.product_type,
            row.quantity,
            row.total_amount,
            row.transaction_date,
            row.transaction_status,
            row.payment_method || ''
        ]);
        
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="statistics_export.csv"');
        res.send(csvContent);
        
        logger.info('Statistics exported', {
            userId: req.user?.id,
            recordCount: exportData.length
        });
        
    } catch (error) {
        logger.error('Error exporting statistics', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to export statistics'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;
