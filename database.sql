-- MariaDB Database Schema for Gastronomic Edge POS

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS gastronomic_edge;
USE gastronomic_edge;

--
-- Table structure for table `team_members`
--
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` ENUM('Basic', 'Advanced', 'Admin') NOT NULL DEFAULT 'Basic',
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL, -- For storing hashed passwords
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `customers`
--
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `total_orders` INT(11) NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `last_visit` DATE DEFAULT NULL,
  `loyalty_points` INT(11) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `restaurant_tables`
--
DROP TABLE IF EXISTS `restaurant_tables`;
CREATE TABLE `restaurant_tables` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `capacity` INT(11) NOT NULL,
  `status` ENUM('Available', 'Occupied', 'Reserved', 'Dirty') NOT NULL DEFAULT 'Available',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `menu_items`
--
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) DEFAULT NULL,
  `vat_rate` DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `menu_item_addons`
--
DROP TABLE IF EXISTS `menu_item_addons`;
CREATE TABLE `menu_item_addons` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `menu_item_id` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `inventory_items`
--
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `stock` DECIMAL(10, 2) NOT NULL,
  `unit` ENUM('kg', 'g', 'liters', 'ml', 'pcs', 'bottles') NOT NULL,
  `low_threshold` DECIMAL(10, 2) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `reservations`
--
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `customer_id` INT(11) NULL,
  `customer_name` VARCHAR(255) NOT NULL, -- Fallback if not linked to a customer
  `party_size` INT(11) NOT NULL,
  `reservation_time` DATETIME NOT NULL,
  `status` ENUM('Confirmed', 'Pending', 'Cancelled', 'Seated') NOT NULL DEFAULT 'Pending',
  `notes` TEXT DEFAULT NULL,
  `table_id` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `orders`
--
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `table_id` INT(11) DEFAULT NULL,
  `customer_id` INT(11) DEFAULT NULL,
  `type` ENUM('Table', 'Collection', 'Delivery', 'Online') NOT NULL DEFAULT 'Table',
  `status` ENUM('Paid', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_method` ENUM('Cash', 'Card', 'Voucher') DEFAULT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `vat_amount` DECIMAL(10, 2) NOT NULL,
  `grand_total` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `order_items`
--
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `menu_item_id` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL,
  `price_per_item` DECIMAL(10, 2) NOT NULL, -- Price at the time of order
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `order_item_addons` (linking table)
--
DROP TABLE IF EXISTS `order_item_addons`;
CREATE TABLE `order_item_addons` (
  `order_item_id` INT(11) NOT NULL,
  `addon_id` INT(11) NOT NULL,
  `price_per_addon` DECIMAL(10, 2) NOT NULL, -- Price at the time of order
  PRIMARY KEY (`order_item_id`, `addon_id`),
  FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`addon_id`) REFERENCES `menu_item_addons` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `settings`
--
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example of inserting default settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('reservations.enabled', 'true'),
('inventory.enabled', 'true'),
('crm.enabled', 'false'),
('delivery_tracking.enabled', 'true'),
('suppliers.enabled', 'false'),
('online_ordering.enabled', 'true'),
('collection.enabled', 'true'),
('delivery_channel.enabled', 'false'),
('customer_display.enabled', 'true'),
('kitchen_display.enabled', 'false'),
('label_printer.enabled', 'true');

-- You can add INSERT statements here to populate with your mock data if needed.
-- Example:
-- INSERT INTO `restaurant_tables` (`capacity`, `status`) VALUES (2, 'Available'), (4, 'Available');
