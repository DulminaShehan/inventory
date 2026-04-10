-- ============================================================
-- Hardware Store Inventory & Billing System — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS hardware_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hardware_store;

-- ─────────────────────────────────────────
-- 1. users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,           -- bcrypt hash
  role       ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────
-- 2. products
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id         INT            NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)   NOT NULL,
  category   VARCHAR(50)    NOT NULL,
  price      DECIMAL(10, 2) NOT NULL,
  quantity   INT            NOT NULL DEFAULT 0,
  unit       ENUM('kg','pcs','meter','liter','box','roll') NOT NULL DEFAULT 'pcs',
  created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category (category),
  INDEX idx_quantity (quantity)   -- speeds up low-stock queries
);

-- ─────────────────────────────────────────
-- 3. sales (header / bill)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id         INT            NOT NULL AUTO_INCREMENT,
  total      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_by INT            NULL,             -- FK to users
  created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_sales_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
-- 4. sales_items (line items)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_items (
  id         INT            NOT NULL AUTO_INCREMENT,
  sale_id    INT            NOT NULL,
  product_id INT            NOT NULL,
  quantity   INT            NOT NULL,
  price      DECIMAL(10, 2) NOT NULL,          -- price AT TIME OF SALE
  subtotal   DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price) STORED,
  PRIMARY KEY (id),
  CONSTRAINT fk_si_sale    FOREIGN KEY (sale_id)    REFERENCES sales(id)    ON DELETE CASCADE,
  CONSTRAINT fk_si_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────
-- Sample seed data (optional — remove in production)
-- ─────────────────────────────────────────
INSERT INTO products (name, category, price, quantity, unit) VALUES
  ('PVC Pipe 1 inch',    'Plumbing',    45.00,  200, 'meter'),
  ('Hammer',             'Tools',      350.00,   50, 'pcs'),
  ('Wood Screw 2 inch',  'Fasteners',    2.50, 1000, 'pcs'),
  ('Cement Bag 40kg',    'Building',   480.00,   80, 'pcs'),
  ('Paint Brush 3 inch', 'Painting',    75.00,   30, 'pcs'),
  ('Steel Rod 10mm',     'Building',   120.00,  150, 'meter'),
  ('Electrical Wire',    'Electrical',  18.00,  500, 'meter'),
  ('Circuit Breaker',    'Electrical', 550.00,    8, 'pcs'),  -- low stock
  ('Sand Paper 120',     'Painting',    12.00,    5, 'pcs'),  -- low stock
  ('Plywood 4x8',        'Building',  1200.00,   25, 'pcs');
