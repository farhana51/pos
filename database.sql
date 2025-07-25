-- MariaDB Database Script for Gastronomic Edge POS

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


-- Table for staff and their roles/permissions
CREATE TABLE `team_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL, -- For storing hashed passwords
    `role` ENUM('Basic', 'Advanced', 'Admin') NOT NULL DEFAULT 'Basic',
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `avatar_url` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for customer information and loyalty
CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE,
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `total_orders` INT DEFAULT 0,
    `total_spent` DECIMAL(10, 2) DEFAULT 0.00,
    `last_visit` DATE,
    `loyalty_points` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for restaurant layout
CREATE TABLE `restaurant_tables` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `capacity` INT NOT NULL,
    `status` ENUM('Available', 'Occupied', 'Reserved', 'Dirty') NOT NULL DEFAULT 'Available'
);

-- Table for menu items
CREATE TABLE `menu_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `subcategory` VARCHAR(100),
    `vat_rate` DECIMAL(4, 2) NOT NULL DEFAULT 20.00, -- e.g., 20.00 for 20%
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for add-ons that can be attached to menu items
CREATE TABLE `menu_item_addons` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `menu_item_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
);

-- Table for inventory management
CREATE TABLE `inventory_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `stock` INT NOT NULL,
    `unit` ENUM('kg', 'g', 'liters', 'ml', 'pcs', 'bottles') NOT NULL,
    `low_threshold` INT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for reservations
CREATE TABLE `reservations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT,
    `customer_name` VARCHAR(255) NOT NULL,
    `party_size` INT NOT NULL,
    `reservation_time` DATETIME NOT NULL,
    `status` ENUM('Confirmed', 'Pending', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Pending',
    `notes` TEXT,
    `table_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE SET NULL
);

-- Table for orders
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `table_id` INT,
    `customer_id` INT,
    `type` ENUM('Table', 'Collection', 'Delivery', 'Online') NOT NULL DEFAULT 'Table',
    `status` ENUM('Paid', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `payment_method` ENUM('Cash', 'Card', 'Voucher'),
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `vat_total` DECIMAL(10, 2) NOT NULL,
    `grand_total` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`),
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
);

-- Junction table for items within an order
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `menu_item_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price_at_time` DECIMAL(10, 2) NOT NULL,
    `vat_rate_at_time` DECIMAL(4, 2) NOT NULL,
    `notes` TEXT,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`)
);

-- Junction table for selected add-ons for an order item
CREATE TABLE `order_item_addons` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_item_id` INT NOT NULL,
    `addon_id` INT NOT NULL,
    `price_at_time` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`addon_id`) REFERENCES `menu_item_addons`(`id`)
);

-- Table for application settings (toggles)
CREATE TABLE `app_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` VARCHAR(10) NOT NULL, -- 'true' or 'false'
    `description` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add Indexes for performance
CREATE INDEX idx_order_created_at ON `orders`(`created_at`);
CREATE INDEX idx_reservation_time ON `reservations`(`reservation_time`);
CREATE INDEX idx_customer_phone ON `customers`(`phone`);
CREATE INDEX idx_menu_item_category ON `menu_items`(`category`);

-- Insert default settings
INSERT INTO `app_settings` (`setting_key`, `setting_value`, `description`) VALUES
('reservations', 'true', 'Allow customers to book tables in advance.'),
('inventory', 'true', 'Track ingredient stock levels.'),
('crm', 'false', 'Manage customer relationships and rewards.'),
('deliveryTracking', 'true', 'Track delivery drivers in real-time.'),
('suppliers', 'false', 'Manage suppliers and purchase orders.'),
('onlineOrdering', 'true', 'Accept orders from your website.'),
('collection', 'true', 'Allow customers to order for pickup.'),
('deliveryChannel', 'false', 'Offer a delivery service.'),
('customerDisplay', 'true', 'Show order details to customers at the counter.'),
('kitchenDisplay', 'false', 'Send orders to a screen instead of printing.'),
('labelPrinter', 'true', 'Enable printing for order labels.');

-- --- END OF SCRIPT ---
