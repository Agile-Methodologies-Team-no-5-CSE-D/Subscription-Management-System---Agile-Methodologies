-- Create Database
CREATE DATABASE IF NOT EXISTS subscription_db;
USE subscription_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255), -- Keep for backward compatibility/legacy migration if needed, but we will use password_hash
    password_hash VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(100),
    address TEXT,
    role ENUM('admin', 'user', 'internal_staff') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('service', 'software', 'goods') DEFAULT 'service',
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    plan VARCHAR(50) NOT NULL,
    status ENUM('Quotation', 'Quotation Sent', 'Confirmed', 'In Progress', 'Churned', 'Closed', 'Cancelled') DEFAULT 'Quotation',
    start_date DATE,
    next_invoice_date DATE,
    recurring_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_term VARCHAR(50),
    sales_person VARCHAR(100),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Subscription Lines (Order Items)
CREATE TABLE IF NOT EXISTS subscription_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE,
    subscription_id INT,
    customer_id INT NOT NULL,
    date DATE,
    due_date DATE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    date DATE,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Success',
    reference VARCHAR(100),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Password Resets Table (OTP)
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Admin User (Password: admin123)
-- In a real app, passwords should be hashed. This is for setup demonstration.
INSERT IGNORE INTO users (name, email, password, role) VALUES ('Admin User', 'admin@example.com', 'admin123', 'admin');

-- Insert Sample Products
INSERT IGNORE INTO products (name, type, price, cost, description, is_active) VALUES 
('Basic Subscription', 'service', 29.00, 10.00, 'Basic monthly subscription', TRUE),
('Pro Subscription', 'service', 59.00, 20.00, 'Professional monthly subscription', TRUE),
('Enterprise License', 'software', 199.00, 50.00, 'Enterprise yearly license', TRUE);
