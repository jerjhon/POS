-- Database: kasir_db
CREATE DATABASE IF NOT EXISTS kasir_db;
USE kasir_db;

-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    category VARCHAR(100),
    image VARCHAR(255),
    price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Table: variants
CREATE TABLE IF NOT EXISTS variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(100),
    size VARCHAR(50),
    stock INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Table: sales
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    discount DECIMAL(10,2) DEFAULT 0,
    add_on DECIMAL(10,2) DEFAULT 0,
    add_on_description VARCHAR(255)
);

-- Table: sale_items
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES variants(id)
);
