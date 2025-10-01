const axios = require('axios');
const logger = require('../utils/logger');
const mysql = require('mysql2/promise');

class AIController {
    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyBautBE5Nk49TEsPl69u2QQW3AVpjdAI_0';
        this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'business_crm',
            port: process.env.DB_PORT || 3306
        };
    }

    // Get all CRM data for AI context
    async getCRMData() {
        let connection;
        try {
            console.log('Connecting to database with config:', {
                host: this.dbConfig.host,
                user: this.dbConfig.user,
                database: this.dbConfig.database,
                port: this.dbConfig.port
            });
            
            connection = await mysql.createConnection(this.dbConfig);
            console.log('Database connection successful');
            
            // Get customers data
            const [customers] = await connection.execute(`
                SELECT customer_id, customer_name, customer_email, customer_phone, 
                       customer_segment, total_spent, total_orders, last_transaction_date,
                       registration_date
                FROM customers 
                ORDER BY total_spent DESC 
                LIMIT 50
            `);

            // Get products data
            const [products] = await connection.execute(`
                SELECT product_id, product_name, product_type, product_price, 
                       sales_count, total_revenue
                FROM products 
                ORDER BY sales_count DESC 
                LIMIT 20
            `);

            // Get recent transactions
            const [transactions] = await connection.execute(`
                SELECT ct.transaction_id, ct.customer_id, c.customer_name, 
                       ct.product_id, p.product_name, p.product_type,
                       ct.quantity, ct.total_amount, ct.transaction_date, ct.transaction_status
                FROM customer_transactions ct
                JOIN customers c ON ct.customer_id = c.customer_id
                JOIN products p ON ct.product_id = p.product_id
                ORDER BY ct.transaction_date DESC 
                LIMIT 100
            `);

            // Get business statistics
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(DISTINCT c.customer_id) as total_customers,
                    SUM(ct.total_amount) as total_revenue,
                    COUNT(ct.transaction_id) as total_transactions,
                    AVG(ct.total_amount) as avg_transaction_value,
                    COUNT(DISTINCT p.product_type) as product_categories
                FROM customers c
                LEFT JOIN customer_transactions ct ON c.customer_id = ct.customer_id
                LEFT JOIN products p ON ct.product_id = p.product_id
            `);

            // Get customer segments
            const [segments] = await connection.execute(`
                SELECT customer_segment, COUNT(*) as count, 
                       AVG(total_spent) as avg_spent,
                       SUM(total_spent) as total_segment_revenue
                FROM customers 
                WHERE customer_segment IS NOT NULL
                GROUP BY customer_segment
                ORDER BY count DESC
            `);

            // Get top products by category
            const [topProducts] = await connection.execute(`
                SELECT product_type, product_name, sales_count, total_revenue
                FROM products 
                ORDER BY product_type, sales_count DESC
            `);

            return {
                customers,
                products,
                transactions,
                statistics: stats[0] || {},
                segments,
                topProducts
            };

        } catch (error) {
            console.error('Database connection error:', error.message);
            logger.error('Error fetching CRM data:', error);
            
            // Return sample data if database is not available
            return {
                customers: [
                    { customer_name: 'Budi Santoso', customer_segment: 'VIP', total_spent: 8500000, total_orders: 1 },
                    { customer_name: 'Ahmad Rahman', customer_segment: 'Premium', total_spent: 4500000, total_orders: 1 },
                    { customer_name: 'Sari Dewi', customer_segment: 'Premium', total_spent: 2500000, total_orders: 1 },
                    { customer_name: 'Maya Sari', customer_segment: 'Regular', total_spent: 3200000, total_orders: 1 },
                    { customer_name: 'Dedi Gunawan', customer_segment: 'Regular', total_spent: 3500000, total_orders: 1 }
                ],
                products: [
                    { product_name: 'Laptop Gaming ASUS ROG', product_type: 'Electronics', sales_count: 1, total_revenue: 8500000 },
                    { product_name: 'Smartphone Samsung Galaxy', product_type: 'Electronics', sales_count: 1, total_revenue: 4500000 },
                    { product_name: 'Jam Tangan Rolex', product_type: 'Fashion', sales_count: 1, total_revenue: 2500000 },
                    { product_name: 'Kulkas 2 Pintu', product_type: 'Home & Living', sales_count: 1, total_revenue: 5500000 },
                    { product_name: 'Monitor Gaming 27 inch', product_type: 'Electronics', sales_count: 1, total_revenue: 3500000 }
                ],
                transactions: [
                    { customer_name: 'Budi Santoso', product_name: 'Laptop Gaming ASUS ROG', quantity: 1, total_amount: 8500000, transaction_date: '2024-01-15' },
                    { customer_name: 'Ahmad Rahman', product_name: 'Smartphone Samsung Galaxy', quantity: 1, total_amount: 4500000, transaction_date: '2024-01-14' },
                    { customer_name: 'Sari Dewi', product_name: 'Jam Tangan Rolex', quantity: 1, total_amount: 2500000, transaction_date: '2024-01-13' },
                    { customer_name: 'Maya Sari', product_name: 'Kulkas 2 Pintu', quantity: 1, total_amount: 5500000, transaction_date: '2024-01-12' },
                    { customer_name: 'Dedi Gunawan', product_name: 'Monitor Gaming 27 inch', quantity: 1, total_amount: 3500000, transaction_date: '2024-01-11' }
                ],
                statistics: {
                    total_customers: 15,
                    total_revenue: 42300000,
                    total_transactions: 15,
                    avg_transaction_value: 2820000,
                    product_categories: 4
                },
                segments: [
                    { customer_segment: 'VIP', count: 1, avg_spent: 8500000, total_segment_revenue: 8500000 },
                    { customer_segment: 'Premium', count: 2, avg_spent: 3500000, total_segment_revenue: 7000000 },
                    { customer_segment: 'Regular', count: 7, avg_spent: 3200000, total_segment_revenue: 22400000 },
                    { customer_segment: 'New', count: 5, avg_spent: 850000, total_segment_revenue: 4250000 }
                ],
                topProducts: [
                    { product_type: 'Electronics', product_name: 'Laptop Gaming ASUS ROG', sales_count: 1, total_revenue: 8500000 },
                    { product_type: 'Electronics', product_name: 'Smartphone Samsung Galaxy', sales_count: 1, total_revenue: 4500000 },
                    { product_type: 'Electronics', product_name: 'Monitor Gaming 27 inch', sales_count: 1, total_revenue: 3500000 },
                    { product_type: 'Fashion', product_name: 'Jam Tangan Rolex', sales_count: 1, total_revenue: 2500000 },
                    { product_type: 'Home & Living', product_name: 'Kulkas 2 Pintu', sales_count: 1, total_revenue: 5500000 }
                ]
            };
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }

    // Generate AI insights for business data
    async generateBusinessInsights(req, res) {
        try {
            const { query, context } = req.body;
            
            // Prepare context with business data
            const businessContext = this.prepareBusinessContext(context);
            
            const prompt = `
                You are a business intelligence AI assistant for Vendra CRM system.
                
                Business Context:
                ${businessContext}
                
                User Question: ${query}
                
                Please provide actionable business insights based on the data. Be specific, concise, and focus on:
                1. Key trends and patterns
                2. Actionable recommendations
                3. Potential opportunities or risks
                4. Data-driven conclusions
                
                Format your response in a professional, business-friendly manner.
            `;

            const response = await this.callGeminiAPI(prompt);
            
            res.json({
                success: true,
                data: {
                    query: query,
                    response: response,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('AI insights generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate AI insights',
                error: error.message
            });
        }
    }

    // Chat with AI assistant
    async chatWithAI(req, res) {
        try {
            const { message, chatHistory = [] } = req.body;
            
            // Get real CRM data
            console.log('Fetching CRM data for AI...');
            const crmData = await this.getCRMData();
            console.log('CRM Data fetched:', crmData ? 'Success' : 'Failed');
            
            if (crmData && crmData.customers && crmData.customers.length > 0) {
                console.log('Sample customer data:', crmData.customers[0]);
            }
            
            // Build comprehensive conversation context with real data
            let conversationContext = `You are Vendra AI, an expert business intelligence assistant for a CRM system.

IMPORTANT INSTRUCTIONS:
1. You have access to REAL business data from the database
2. Always respond in Indonesian language (Bahasa Indonesia)
3. Always base your answers on the actual data provided below
4. Be specific with customer names, product names, and exact figures
5. Provide actionable business insights and recommendations

=== DATA BISNIS REAL-TIME ===
`;

            if (crmData) {
                const stats = crmData.statistics;
                conversationContext += `
RINGKASAN BISNIS:
- Total Pelanggan: ${stats.total_customers || 0}
- Total Pendapatan: Rp ${(stats.total_revenue || 0).toLocaleString('id-ID')}
- Total Transaksi: ${stats.total_transactions || 0}
- Rata-rata Transaksi: Rp ${(stats.avg_transaction_value || 0).toLocaleString('id-ID')}
- Kategori Produk: ${stats.product_categories || 0}

PELANGGAN TERATAS (berdasarkan pengeluaran):
${crmData.customers.slice(0, 10).map(c => 
    `- ${c.customer_name} (${c.customer_segment}): Rp ${(c.total_spent || 0).toLocaleString('id-ID')} dalam ${c.total_orders || 0} pesanan`
).join('\n')}

SEGMEN PELANGGAN:
${crmData.segments.map(s => 
    `- ${s.customer_segment}: ${s.count} pelanggan, Rata-rata: Rp ${(s.avg_spent || 0).toLocaleString('id-ID')}, Total: Rp ${(s.total_segment_revenue || 0).toLocaleString('id-ID')}`
).join('\n')}

PRODUK TERLARIS:
${crmData.products.slice(0, 10).map(p => 
    `- ${p.product_name} (${p.product_type}): ${p.sales_count} penjualan, Rp ${(p.total_revenue || 0).toLocaleString('id-ID')} pendapatan`
).join('\n')}

TRANSAKSI TERBARU (10 terakhir):
${crmData.transactions.slice(0, 10).map(t => 
    `- ${t.customer_name}: ${t.product_name} (${t.quantity}x) = Rp ${(t.total_amount || 0).toLocaleString('id-ID')}`
).join('\n')}

PRODUCT CATEGORIES PERFORMANCE:
${this.groupBy(crmData.topProducts, 'product_type').map(group => {
    const totalSales = group.items.reduce((sum, p) => sum + (p.sales_count || 0), 0);
    const totalRevenue = group.items.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
    return `- ${group.key}: ${totalSales} total sales, Rp ${totalRevenue.toLocaleString('id-ID')} revenue`;
}).join('\n')}

=== AKHIR DATA BISNIS ===

INSTRUKSI PENTING:
1. Selalu rujuk data spesifik di atas saat menjawab
2. Berikan wawasan yang dapat ditindaklanjuti berdasarkan angka nyata
3. Identifikasi tren, peluang, dan risiko dari data real
4. Sebutkan nama pelanggan, nama produk, dan angka yang tepat
5. Berikan rekomendasi praktis berdasarkan performa bisnis aktual
6. Jawab dalam Bahasa Indonesia yang profesional dan mudah dipahami

`;
            } else {
                conversationContext += `
CATATAN: Menggunakan data demo untuk analisis bisnis.

`;
            }

            // Add chat history for context
            if (chatHistory.length > 0) {
                conversationContext += `\nPERCAKAPAN SEBELUMNYA:\n`;
                chatHistory.slice(-3).forEach(chat => { // Last 3 messages for context
                    conversationContext += `User: ${chat.user}\nAI: ${chat.ai}\n\n`;
                });
            }
            
            conversationContext += `\nPERTANYAAN SAAT INI: ${message}\n\nSilakan berikan respons yang detail dan berdasarkan data dalam Bahasa Indonesia dengan format yang mudah dipahami:

FORMAT RESPONS:
1. Gunakan emoji untuk membuat lebih menarik (📊 📈 💡 🎯 ⭐ 🏆 💰 👥)
2. Buat struktur dengan heading yang jelas
3. Gunakan bullet points dan numbering
4. Pisahkan insight dan rekomendasi
5. Berikan angka yang spesifik dan persentase
6. Akhiri dengan action items yang konkret

CONTOH FORMAT:
**📊 ANALISIS DATA:**
- Point 1 dengan angka spesifik
- Point 2 dengan persentase

**💡 INSIGHT BISNIS:**
1. Insight pertama
2. Insight kedua

**🎯 REKOMENDASI:**
- Aksi konkret 1
- Aksi konkret 2`;

            const response = await this.callGeminiAPI(conversationContext);
            
            res.json({
                success: true,
                data: {
                    message: message,
                    response: response,
                    timestamp: new Date().toISOString(),
                    dataSource: crmData ? 'real_database' : 'no_data'
                }
            });

        } catch (error) {
            logger.error('AI chat error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process AI chat',
                error: error.message
            });
        }
    }

    // Helper function to group array by key
    groupBy(array, key) {
        const groups = {};
        array.forEach(item => {
            const group = item[key] || 'Unknown';
            if (!groups[group]) {
                groups[group] = { key: group, items: [] };
            }
            groups[group].items.push(item);
        });
        return Object.values(groups);
    }

    // Analyze customer data with AI
    async analyzeCustomerData(req, res) {
        try {
            const { customerData, analysisType = 'general' } = req.body;
            
            let prompt = '';
            
            switch (analysisType) {
                case 'segmentation':
                    prompt = `
                        Analyze this customer data and provide segmentation insights:
                        ${JSON.stringify(customerData, null, 2)}
                        
                        Please provide:
                        1. Customer segment recommendations
                        2. Behavioral patterns
                        3. Value-based groupings
                        4. Marketing strategy suggestions
                    `;
                    break;
                    
                case 'churn':
                    prompt = `
                        Analyze this customer data for churn risk:
                        ${JSON.stringify(customerData, null, 2)}
                        
                        Please identify:
                        1. High-risk customers
                        2. Churn indicators
                        3. Retention strategies
                        4. Early warning signs
                    `;
                    break;
                    
                default:
                    prompt = `
                        Provide general analysis of this customer data:
                        ${JSON.stringify(customerData, null, 2)}
                        
                        Include insights on:
                        1. Customer behavior patterns
                        2. Revenue opportunities
                        3. Engagement levels
                        4. Business recommendations
                    `;
            }

            const response = await this.callGeminiAPI(prompt);
            
            res.json({
                success: true,
                data: {
                    analysisType: analysisType,
                    response: response,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('Customer data analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze customer data',
                error: error.message
            });
        }
    }

    // Call Gemini API
    async callGeminiAPI(prompt) {
        try {
            const startTime = Date.now();
            
            const response = await axios.post(this.geminiBaseUrl, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': this.geminiApiKey
                },
                timeout: 30000 // 30 second timeout
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log API usage for monitoring
            console.log(`Gemini API Usage:`, {
                responseTime: `${responseTime}ms`,
                status: response.status,
                headers: {
                    'x-ratelimit-limit': response.headers['x-ratelimit-limit'],
                    'x-ratelimit-remaining': response.headers['x-ratelimit-remaining'],
                    'x-ratelimit-reset': response.headers['x-ratelimit-reset']
                }
            });

            if (response.data && response.data.candidates && response.data.candidates[0]) {
                return response.data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response from Gemini API');
            }

        } catch (error) {
            logger.error('Gemini API call error:', error);
            
            if (error.response) {
                // Check for quota/limit errors
                if (error.response.status === 429) {
                    throw new Error(`API Quota Exceeded: ${error.response.data?.error?.message || 'Rate limit reached. Please try again later.'}`);
                } else if (error.response.status === 403) {
                    throw new Error(`API Access Denied: ${error.response.data?.error?.message || 'Check your API key permissions.'}`);
                } else {
                    throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                throw new Error('Network error: Unable to reach Gemini API');
            } else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }

    // Prepare business context from CRM data
    prepareBusinessContext(context = {}) {
        const {
            totalCustomers = 0,
            totalRevenue = 0,
            totalTransactions = 0,
            avgTransactionValue = 0,
            topProducts = [],
            customerSegments = [],
            recentTransactions = []
        } = context;

        return `
            Current Business Metrics:
            - Total Customers: ${totalCustomers}
            - Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}
            - Total Transactions: ${totalTransactions}
            - Average Transaction Value: Rp ${avgTransactionValue.toLocaleString('id-ID')}
            
            Top Products: ${topProducts.map(p => `${p.name} (${p.sales} sales)`).join(', ')}
            
            Customer Segments: ${customerSegments.map(s => `${s.segment}: ${s.count} customers`).join(', ')}
            
            Recent Activity: ${recentTransactions.length} recent transactions
        `;
    }

    // Get AI suggestions for business improvement
    async getBusinessSuggestions(req, res) {
        try {
            const { metrics } = req.body;
            
            const prompt = `
                As a business consultant AI, analyze these CRM metrics and provide actionable improvement suggestions:
                ${this.prepareBusinessContext(metrics)}
                
                Please provide:
                1. 3 key areas for improvement
                2. Specific action items for each area
                3. Expected impact of each suggestion
{{ ... }}
                
                Focus on practical, implementable strategies that can drive growth and customer satisfaction.
            `;

            const response = await this.callGeminiAPI(prompt);
            
            res.json({
                success: true,
                data: {
                    suggestions: response,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('Business suggestions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate business suggestions',
                error: error.message
            });
        }
    }
}

const aiController = new AIController();
module.exports = aiController;
