-- Vendra CRM Database Setup
-- Create database and tables for real data

-- Create database
CREATE DATABASE IF NOT EXISTS business_crm;
USE business_crm;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS customer_transactions;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;

-- Create customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unique_customer_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    phone VARCHAR(20),
    company_name VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    customer_segment VARCHAR(20) DEFAULT 'Regular',
    registration_date DATE DEFAULT (CURRENT_DATE),
    last_purchase_date DATE,
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(15,2) NOT NULL,
    cost DECIMAL(15,2),
    stock_quantity INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    description TEXT,
    supplier VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customer_transactions table
CREATE TABLE customer_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    unique_customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_time TIME DEFAULT (CURRENT_TIME),
    transaction_status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (unique_customer_id) REFERENCES customers(unique_customer_id) ON UPDATE CASCADE,
    FOREIGN KEY (product_code) REFERENCES products(product_code) ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_customer_transactions_date ON customer_transactions(transaction_date);
CREATE INDEX idx_customer_transactions_status ON customer_transactions(transaction_status);
CREATE INDEX idx_customer_transactions_customer ON customer_transactions(unique_customer_id);
CREATE INDEX idx_customer_transactions_product ON customer_transactions(product_code);
CREATE INDEX idx_customers_segment ON customers(customer_segment);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_status ON products(status);

-- Create views for easier querying
CREATE VIEW v_customer_summary AS
SELECT 
    c.unique_customer_id,
    c.customer_name,
    c.customer_email,
    c.customer_segment,
    c.registration_date,
    COUNT(t.id) as total_orders,
    COALESCE(SUM(t.final_amount), 0) as total_spent,
    MAX(t.transaction_date) as last_purchase_date,
    AVG(t.final_amount) as avg_order_value
FROM customers c
LEFT JOIN customer_transactions t ON c.unique_customer_id = t.unique_customer_id 
    AND t.transaction_status = 'completed'
GROUP BY c.unique_customer_id, c.customer_name, c.customer_email, c.customer_segment, c.registration_date;

CREATE VIEW v_product_summary AS
SELECT 
    p.product_code,
    p.product_name,
    p.product_type,
    p.price,
    COUNT(t.id) as sales_count,
    COALESCE(SUM(t.quantity), 0) as total_quantity_sold,
    COALESCE(SUM(t.final_amount), 0) as total_revenue,
    AVG(t.final_amount) as avg_sale_amount
FROM products p
LEFT JOIN customer_transactions t ON p.product_code = t.product_code 
    AND t.transaction_status = 'completed'
GROUP BY p.product_code, p.product_name, p.product_type, p.price;

CREATE VIEW v_monthly_revenue AS
SELECT 
    YEAR(transaction_date) as year,
    MONTH(transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(final_amount) as total_revenue,
    AVG(final_amount) as avg_transaction_value
FROM customer_transactions 
WHERE transaction_status = 'completed'
GROUP BY YEAR(transaction_date), MONTH(transaction_date)
ORDER BY year DESC, month DESC;

-- Show tables created
SHOW TABLES;
