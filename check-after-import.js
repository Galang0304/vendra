// Check Stats After Import
const mysql = require('mysql2/promise');

async function checkStatsAfterImport() {
    try {
        console.log('📊 STATS SETELAH IMPORT:\n');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'business_crm'
        });
        
        // Get overall stats
        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_revenue,
                COUNT(DISTINCT unique_customer_id) as total_customers
            FROM customer_transactions
        `);
        
        console.log('📈 OVERALL STATISTICS:');
        console.log('- Total Transaksi:', stats[0].total_transactions);
        console.log('- Total Revenue: Rp', parseInt(stats[0].total_revenue).toLocaleString('id-ID'));
        console.log('- Total Customers:', stats[0].total_customers);
        
        // Check new customers from import
        const [newCustomers] = await connection.execute(`
            SELECT unique_customer_id, customer_name, COUNT(*) as transactions, SUM(total_amount) as revenue
            FROM customer_transactions 
            WHERE unique_customer_id LIKE 'CUST%9' OR unique_customer_id LIKE 'CUST01%' OR unique_customer_id LIKE 'CUST02%'
            GROUP BY unique_customer_id, customer_name
            ORDER BY unique_customer_id
        `);
        
        if (newCustomers.length > 0) {
            console.log('\n🆕 NEW CUSTOMERS FROM IMPORT:');
            newCustomers.forEach(customer => {
                console.log(`- ${customer.unique_customer_id}: ${customer.customer_name} - Rp ${parseInt(customer.revenue).toLocaleString('id-ID')}`);
            });
        }
        
        // Calculate monthly revenue after import
        const [monthlyStats] = await connection.execute(`
            SELECT 
                MONTHNAME(transaction_date) as month,
                COUNT(*) as transactions,
                SUM(total_amount) as revenue
            FROM customer_transactions
            GROUP BY MONTH(transaction_date), MONTHNAME(transaction_date)
            ORDER BY MONTH(transaction_date)
        `);
        
        console.log('\n📊 MONTHLY REVENUE (Updated):');
        monthlyStats.forEach(month => {
            console.log(`- ${month.month}: Rp ${parseInt(month.revenue).toLocaleString('id-ID')} (${month.transactions} trans)`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkStatsAfterImport();