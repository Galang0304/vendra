-- Vendra CRM Database Setup (Simple Version)
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
    customer_segment VARCHAR(20) DEFAULT 'Regular',
    registration_date DATE DEFAULT (CURRENT_DATE),
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    final_amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_date ON customer_transactions(transaction_date);
CREATE INDEX idx_transactions_customer ON customer_transactions(unique_customer_id);
CREATE INDEX idx_transactions_product ON customer_transactions(product_code);
