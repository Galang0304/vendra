const express = require('express');
const { pool } = require('../utils/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        // Get total statistics
        const [totalStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_transaction_value,
                COUNT(DISTINCT unique_customer_id) as total_customers
            FROM customer_transactions
            WHERE transaction_status = 'completed'
        `);

        // Get monthly revenue trend
        const [monthlyTrend] = await pool.execute(`
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                COUNT(*) as transaction_count,
                SUM(total_amount) as total_revenue
            FROM customer_transactions
            WHERE transaction_status = 'completed'
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month ASC
        `);

        res.json({
            success: true,
            data: {
                summary: totalStats[0],
                monthly_trend: monthlyTrend
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data analytics'
        });
    }
});

// Get top products
router.get('/top-products', authenticateToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const [products] = await pool.execute(`
            SELECT 
                product_type,
                product_name,
                COUNT(*) as transaction_count,
                SUM(total_amount) as total_revenue,
                SUM(quantity) as total_quantity,
                AVG(unit_price) as avg_price
            FROM customer_transactions
            WHERE transaction_status = 'completed'
            GROUP BY product_type, product_name
            ORDER BY total_revenue DESC
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json({
            success: true,
            data: products
        });
        
    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data top products'
        });
    }
});

// Get recent transactions
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const [transactions] = await pool.execute(`
            SELECT 
                unique_customer_id,
                transaction_date,
                customer_name,
                customer_email,
                customer_phone,
                product_type,
                product_name,
                quantity,
                unit_price,
                total_amount,
                payment_method,
                transaction_status
            FROM customer_transactions
            ORDER BY transaction_date DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        // Get total count
        const [countResult] = await pool.execute(`
            SELECT COUNT(*) as total FROM customer_transactions
        `);
        
        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });
        
    } catch (error) {
        console.error('Transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data transaksi'
        });
    }
});

// Get customer analytics
router.get('/customers', authenticateToken, async (req, res) => {
    try {
        const [customers] = await pool.execute(`
            SELECT 
                unique_customer_id,
                customer_name,
                customer_email,
                customer_phone,
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_spent,
                AVG(total_amount) as avg_transaction_value,
                MIN(transaction_date) as first_purchase,
                MAX(transaction_date) as last_purchase
            FROM customer_transactions
            WHERE transaction_status = 'completed'
            GROUP BY unique_customer_id, customer_name, customer_email, customer_phone
            ORDER BY total_spent DESC
            LIMIT 50
        `);
        
        res.json({
            success: true,
            data: customers
        });
        
    } catch (error) {
        console.error('Customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data customer'
        });
    }
});

module.exports = router;
