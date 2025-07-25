
-- MariaDB Script for Gastronomic Edge POS

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `order_item_addons`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `inventory_items`;
DROP TABLE IF EXISTS `menu_item_addons`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `restaurant_tables`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `app_settings`;

-- Table for Application Settings
CREATE TABLE `app_settings` (
    `setting_key` VARCHAR(50) PRIMARY KEY NOT NULL,
    `setting_value` VARCHAR(255) NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Staff / Team Members
CREATE TABLE `team_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('Basic', 'Advanced', 'Admin') NOT NULL DEFAULT 'Basic',
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `avatar_url` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Customers
CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE,
    `phone` VARCHAR(20),
    `total_orders` INT DEFAULT 0,
    `total_spent` DECIMAL(10, 2) DEFAULT 0.00,
    `loyalty_points` INT DEFAULT 0,
    `last_visit` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Restaurant Tables
CREATE TABLE `restaurant_tables` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `capacity` INT NOT NULL,
    `status` ENUM('Available', 'Occupied', 'Reserved', 'Dirty') NOT NULL DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Menu Items
CREATE TABLE `menu_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `subcategory` VARCHAR(50),
    `vat_rate` DECIMAL(4, 2) NOT NULL DEFAULT 20.00,
    `is_available` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Menu Item Add-ons
CREATE TABLE `menu_item_addons` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `menu_item_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Inventory Items
CREATE TABLE `inventory_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `stock` DECIMAL(10, 2) NOT NULL,
    `unit` ENUM('kg', 'g', 'liters', 'ml', 'pcs', 'bottles') NOT NULL,
    `low_threshold` DECIMAL(10, 2) NOT NULL,
    `supplier_id` INT, -- Assuming a future suppliers table
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Reservations
CREATE TABLE `reservations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT,
    `customer_name` VARCHAR(100) NOT NULL, -- Keep name for non-registered customers
    `party_size` INT NOT NULL,
    `reservation_time` TIMESTAMP NOT NULL,
    `status` ENUM('Confirmed', 'Pending', 'Cancelled', 'Seated') NOT NULL DEFAULT 'Pending',
    `notes` TEXT,
    `table_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Orders
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `table_id` INT,
    `customer_id` INT,
    `order_type` ENUM('Table', 'Collection', 'Delivery', 'Online') NOT NULL,
    `status` ENUM('Pending', 'Paid', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `payment_method` ENUM('Cash', 'Card', 'Voucher'),
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `vat_amount` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Linking table for Order Items (Many-to-Many between Orders and Menu Items)
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `menu_item_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price_at_time` DECIMAL(10, 2) NOT NULL, -- Price when ordered
    `notes` TEXT,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Linking table for selected addons in an order item
CREATE TABLE `order_item_addons` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_item_id` INT NOT NULL,
    `addon_id` INT NOT NULL,
    `price_at_time` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`addon_id`) REFERENCES `menu_item_addons`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Add Indexes for performance
CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_reservation_time ON reservations(reservation_time);

-- Insert initial settings
INSERT INTO `app_settings` (`setting_key`, `setting_value`) VALUES
('reservations_enabled', 'true'),
('inventory_enabled', 'true'),
('crm_enabled', 'false'),
('delivery_tracking_enabled', 'true'),
('suppliers_enabled', 'false'),
('online_ordering_enabled', 'true'),
('collection_enabled', 'true'),
('delivery_channel_enabled', 'false'),
('customer_display_enabled', 'true'),
('kitchen_display_enabled', 'false'),
('label_printer_enabled', 'true');

-- You can add some mock data insertion scripts here for testing if you want
-- For example:
-- INSERT INTO `team_members` (`name`, `email`, `password_hash`, `role`) VALUES ('Admin User', 'admin@example.com', 'some_hashed_password', 'Admin');

