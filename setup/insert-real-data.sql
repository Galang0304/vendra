-- Insert Real Data for Vendra CRM
USE business_crm;

-- Insert Customers (Real Indonesian Business Data)
INSERT INTO customers (unique_customer_id, customer_name, customer_email, phone, company_name, address, city, postal_code, customer_segment, registration_date) VALUES
('CUST001', 'Budi Santoso', 'budi@tekmaju.co.id', '+62812345678', 'PT. Teknologi Maju Indonesia', 'Jl. Sudirman No. 45', 'Jakarta', '10110', 'VIP', '2024-01-15'),
('CUST002', 'Sari Wijaya', 'sari@suksesbersama.com', '+62813456789', 'CV. Sukses Bersama', 'Jl. Gatot Subroto No. 123', 'Jakarta', '12930', 'Premium', '2024-02-20'),
('CUST003', 'Ahmad Rahman', 'ahmad@elektronikjaya.com', '+62814567890', 'Toko Elektronik Jaya', 'Jl. Mangga Besar No. 78', 'Jakarta', '11180', 'Premium', '2024-03-10'),
('CUST004', 'Lisa Chen', 'lisa@fashionstore.co.id', '+62815678901', 'Fashion Store Premium', 'Jl. Kemang Raya No. 56', 'Jakarta', '12560', 'Regular', '2024-04-05'),
('CUST005', 'Dedi Kurniawan', 'dedi@bookstore.co.id', '+62816789012', 'Bookstore Central', 'Jl. Cikini Raya No. 89', 'Jakarta', '10330', 'Regular', '2024-05-12'),
('CUST006', 'Maya Sari', 'maya@digitalsolution.com', '+62817890123', 'PT. Digital Solution', 'Jl. Kuningan No. 234', 'Jakarta', '12940', 'VIP', '2024-06-18'),
('CUST007', 'Rudi Hartono', 'rudi@mobileshop.co.id', '+62818901234', 'Mobile Shop Indonesia', 'Jl. Palmerah No. 67', 'Jakarta', '11480', 'Premium', '2024-07-22'),
('CUST008', 'Indira Putri', 'indira@beautycare.co.id', '+62819012345', 'Beauty Care Store', 'Jl. Senayan No. 45', 'Jakarta', '12190', 'Regular', '2024-08-15'),
('CUST009', 'Bambang Susilo', 'bambang@otomotif.co.id', '+62820123456', 'Otomotif Nusantara', 'Jl. Hayam Wuruk No. 123', 'Jakarta', '11160', 'VIP', '2024-09-03'),
('CUST010', 'Rina Marlina', 'rina@homefurniture.com', '+62821234567', 'Home Furniture Gallery', 'Jl. Panjang No. 78', 'Jakarta', '11520', 'Premium', '2024-09-20');

-- Insert Products (Real Indonesian Market Products)
INSERT INTO products (product_code, product_name, product_type, category, price, cost, stock_quantity, description, supplier) VALUES
('ELEC001', 'Laptop Gaming ASUS ROG Strix G15', 'Electronics', 'Computers', 15000000, 12000000, 25, 'Gaming laptop with RTX 4060, AMD Ryzen 7', 'ASUS Indonesia'),
('ELEC002', 'iPhone 15 Pro 256GB', 'Electronics', 'Mobile Phones', 18000000, 15000000, 30, 'Latest iPhone with A17 Pro chip', 'Apple Indonesia'),
('ELEC003', 'Samsung Galaxy S24 Ultra', 'Electronics', 'Mobile Phones', 16000000, 13000000, 20, 'Flagship Android with S Pen', 'Samsung Indonesia'),
('ELEC004', 'MacBook Pro M3 14 inch', 'Electronics', 'Computers', 25000000, 20000000, 15, 'Professional laptop for creators', 'Apple Indonesia'),
('ELEC005', 'Dell XPS 13 Plus', 'Electronics', 'Computers', 18000000, 14000000, 18, 'Ultra-portable business laptop', 'Dell Indonesia'),
('ELEC006', 'Sony WH-1000XM5 Headphones', 'Electronics', 'Audio', 4500000, 3500000, 40, 'Premium noise-canceling headphones', 'Sony Indonesia'),
('ELEC007', 'iPad Air M2 256GB', 'Electronics', 'Tablets', 12000000, 9500000, 25, 'Powerful tablet for work and creativity', 'Apple Indonesia'),
('ELEC008', 'Samsung 55" QLED 4K TV', 'Electronics', 'TV & Audio', 8500000, 6500000, 12, '4K Smart TV with Quantum Dot technology', 'Samsung Indonesia'),
('FASH001', 'Kemeja Batik Premium Pria', 'Fashion', 'Clothing', 450000, 300000, 50, 'Batik berkualitas tinggi untuk formal', 'Batik Nusantara'),
('FASH002', 'Dress Wanita Elegant', 'Fashion', 'Clothing', 650000, 400000, 35, 'Dress formal untuk acara penting', 'Fashion House Jakarta'),
('FASH003', 'Sepatu Nike Air Max 270', 'Fashion', 'Footwear', 1800000, 1200000, 28, 'Sepatu olahraga premium', 'Nike Indonesia'),
('FASH004', 'Tas Kulit Genuine Leather', 'Fashion', 'Accessories', 850000, 550000, 22, 'Tas kulit asli berkualitas tinggi', 'Leather Craft Indonesia'),
('BOOK001', 'Buku Programming Python', 'Books', 'Technology', 250000, 180000, 100, 'Panduan lengkap belajar Python', 'Penerbit Teknologi'),
('BOOK002', 'Novel Bestseller Indonesia', 'Books', 'Literature', 120000, 80000, 75, 'Novel terpopuler tahun ini', 'Gramedia'),
('HOME001', 'Kursi Kantor Ergonomis', 'Home & Office', 'Furniture', 2500000, 1800000, 15, 'Kursi kantor dengan dukungan punggung', 'Office Furniture Co'),
('HOME002', 'Meja Kerja Minimalis', 'Home & Office', 'Furniture', 1200000, 800000, 20, 'Meja kerja modern untuk home office', 'Furniture Modern');

-- Insert Transactions (Real transaction data for last 6 months)
INSERT INTO customer_transactions (transaction_id, unique_customer_id, customer_name, customer_email, product_code, product_name, product_type, quantity, unit_price, total_amount, final_amount, transaction_date, payment_method, payment_status) VALUES
-- January 2024
('TXN001', 'CUST001', 'Budi Santoso', 'budi@tekmaju.co.id', 'ELEC001', 'Laptop Gaming ASUS ROG Strix G15', 'Electronics', 2, 15000000, 30000000, 30000000, '2024-01-20', 'bank_transfer', 'paid'),
('TXN002', 'CUST002', 'Sari Wijaya', 'sari@suksesbersama.com', 'ELEC002', 'iPhone 15 Pro 256GB', 'Electronics', 1, 18000000, 18000000, 18000000, '2024-01-25', 'credit_card', 'paid'),
('TXN003', 'CUST003', 'Ahmad Rahman', 'ahmad@elektronikjaya.com', 'ELEC006', 'Sony WH-1000XM5 Headphones', 'Electronics', 3, 4500000, 13500000, 13500000, '2024-01-28', 'bank_transfer', 'paid'),

-- February 2024
('TXN004', 'CUST004', 'Lisa Chen', 'lisa@fashionstore.co.id', 'FASH002', 'Dress Wanita Elegant', 'Fashion', 5, 650000, 3250000, 3250000, '2024-02-05', 'credit_card', 'paid'),
('TXN005', 'CUST001', 'Budi Santoso', 'budi@tekmaju.co.id', 'ELEC004', 'MacBook Pro M3 14 inch', 'Electronics', 1, 25000000, 25000000, 25000000, '2024-02-12', 'bank_transfer', 'paid'),
('TXN006', 'CUST005', 'Dedi Kurniawan', 'dedi@bookstore.co.id', 'BOOK001', 'Buku Programming Python', 'Books', 20, 250000, 5000000, 5000000, '2024-02-18', 'bank_transfer', 'paid'),

-- March 2024
('TXN007', 'CUST006', 'Maya Sari', 'maya@digitalsolution.com', 'ELEC003', 'Samsung Galaxy S24 Ultra', 'Electronics', 2, 16000000, 32000000, 32000000, '2024-03-08', 'bank_transfer', 'paid'),
('TXN008', 'CUST007', 'Rudi Hartono', 'rudi@mobileshop.co.id', 'ELEC002', 'iPhone 15 Pro 256GB', 'Electronics', 3, 18000000, 54000000, 54000000, '2024-03-15', 'credit_card', 'paid'),
('TXN009', 'CUST003', 'Ahmad Rahman', 'ahmad@elektronikjaya.com', 'ELEC008', 'Samsung 55" QLED 4K TV', 'Electronics', 2, 8500000, 17000000, 17000000, '2024-03-22', 'bank_transfer', 'paid'),

-- April 2024
('TXN010', 'CUST008', 'Indira Putri', 'indira@beautycare.co.id', 'FASH004', 'Tas Kulit Genuine Leather', 'Fashion', 4, 850000, 3400000, 3400000, '2024-04-10', 'credit_card', 'paid'),
('TXN011', 'CUST009', 'Bambang Susilo', 'bambang@otomotif.co.id', 'HOME001', 'Kursi Kantor Ergonomis', 'Home & Office', 6, 2500000, 15000000, 15000000, '2024-04-18', 'bank_transfer', 'paid'),
('TXN012', 'CUST002', 'Sari Wijaya', 'sari@suksesbersama.com', 'ELEC007', 'iPad Air M2 256GB', 'Electronics', 2, 12000000, 24000000, 24000000, '2024-04-25', 'credit_card', 'paid'),

-- May 2024
('TXN013', 'CUST010', 'Rina Marlina', 'rina@homefurniture.com', 'HOME002', 'Meja Kerja Minimalis', 'Home & Office', 8, 1200000, 9600000, 9600000, '2024-05-05', 'bank_transfer', 'paid'),
('TXN014', 'CUST001', 'Budi Santoso', 'budi@tekmaju.co.id', 'ELEC005', 'Dell XPS 13 Plus', 'Electronics', 1, 18000000, 18000000, 18000000, '2024-05-12', 'bank_transfer', 'paid'),
('TXN015', 'CUST004', 'Lisa Chen', 'lisa@fashionstore.co.id', 'FASH003', 'Sepatu Nike Air Max 270', 'Fashion', 6, 1800000, 10800000, 10800000, '2024-05-20', 'credit_card', 'paid'),

-- June 2024
('TXN016', 'CUST006', 'Maya Sari', 'maya@digitalsolution.com', 'ELEC001', 'Laptop Gaming ASUS ROG Strix G15', 'Electronics', 3, 15000000, 45000000, 45000000, '2024-06-08', 'bank_transfer', 'paid'),
('TXN017', 'CUST007', 'Rudi Hartono', 'rudi@mobileshop.co.id', 'ELEC006', 'Sony WH-1000XM5 Headphones', 'Electronics', 5, 4500000, 22500000, 22500000, '2024-06-15', 'credit_card', 'paid'),
('TXN018', 'CUST005', 'Dedi Kurniawan', 'dedi@bookstore.co.id', 'BOOK002', 'Novel Bestseller Indonesia', 'Books', 50, 120000, 6000000, 6000000, '2024-06-22', 'bank_transfer', 'paid'),

-- July 2024
('TXN019', 'CUST009', 'Bambang Susilo', 'bambang@otomotif.co.id', 'ELEC004', 'MacBook Pro M3 14 inch', 'Electronics', 2, 25000000, 50000000, 50000000, '2024-07-10', 'bank_transfer', 'paid'),
('TXN020', 'CUST003', 'Ahmad Rahman', 'ahmad@elektronikjaya.com', 'ELEC003', 'Samsung Galaxy S24 Ultra', 'Electronics', 4, 16000000, 64000000, 64000000, '2024-07-18', 'bank_transfer', 'paid'),
('TXN021', 'CUST008', 'Indira Putri', 'indira@beautycare.co.id', 'FASH001', 'Kemeja Batik Premium Pria', 'Fashion', 12, 450000, 5400000, 5400000, '2024-07-25', 'credit_card', 'paid'),

-- August 2024
('TXN022', 'CUST010', 'Rina Marlina', 'rina@homefurniture.com', 'ELEC007', 'iPad Air M2 256GB', 'Electronics', 3, 12000000, 36000000, 36000000, '2024-08-05', 'bank_transfer', 'paid'),
('TXN023', 'CUST002', 'Sari Wijaya', 'sari@suksesbersama.com', 'ELEC008', 'Samsung 55" QLED 4K TV', 'Electronics', 1, 8500000, 8500000, 8500000, '2024-08-12', 'credit_card', 'paid'),
('TXN024', 'CUST001', 'Budi Santoso', 'budi@tekmaju.co.id', 'ELEC002', 'iPhone 15 Pro 256GB', 'Electronics', 4, 18000000, 72000000, 72000000, '2024-08-20', 'bank_transfer', 'paid'),

-- September 2024
('TXN025', 'CUST006', 'Maya Sari', 'maya@digitalsolution.com', 'ELEC005', 'Dell XPS 13 Plus', 'Electronics', 2, 18000000, 36000000, 36000000, '2024-09-08', 'bank_transfer', 'paid'),
('TXN026', 'CUST004', 'Lisa Chen', 'lisa@fashionstore.co.id', 'FASH002', 'Dress Wanita Elegant', 'Fashion', 8, 650000, 5200000, 5200000, '2024-09-15', 'credit_card', 'paid'),
('TXN027', 'CUST007', 'Rudi Hartono', 'rudi@mobileshop.co.id', 'ELEC001', 'Laptop Gaming ASUS ROG Strix G15', 'Electronics', 1, 15000000, 15000000, 15000000, '2024-09-22', 'credit_card', 'paid'),

-- October 2024 (Recent)
('TXN028', 'CUST009', 'Bambang Susilo', 'bambang@otomotif.co.id', 'ELEC006', 'Sony WH-1000XM5 Headphones', 'Electronics', 8, 4500000, 36000000, 36000000, '2024-10-01', 'bank_transfer', 'paid');

-- Update customer totals based on transactions
UPDATE customers c SET 
    total_spent = (
        SELECT COALESCE(SUM(final_amount), 0) 
        FROM customer_transactions t 
        WHERE t.unique_customer_id = c.unique_customer_id 
        AND t.transaction_status = 'completed'
    ),
    total_orders = (
        SELECT COUNT(*) 
        FROM customer_transactions t 
        WHERE t.unique_customer_id = c.unique_customer_id 
        AND t.transaction_status = 'completed'
    ),
    last_purchase_date = (
        SELECT MAX(transaction_date) 
        FROM customer_transactions t 
        WHERE t.unique_customer_id = c.unique_customer_id 
        AND t.transaction_status = 'completed'
    );

-- Update customer segments based on spending
UPDATE customers SET customer_segment = 
    CASE 
        WHEN total_spent >= 100000000 THEN 'VIP'
        WHEN total_spent >= 50000000 THEN 'Premium'
        WHEN total_spent >= 10000000 THEN 'Regular'
        ELSE 'New'
    END;

-- Show summary
SELECT 'Database Setup Complete' as Status;
SELECT COUNT(*) as Total_Customers FROM customers;
SELECT COUNT(*) as Total_Products FROM products;
SELECT COUNT(*) as Total_Transactions FROM customer_transactions;
SELECT SUM(final_amount) as Total_Revenue FROM customer_transactions WHERE transaction_status = 'completed';
