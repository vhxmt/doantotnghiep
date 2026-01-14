-- Migration: Remove unused columns from tables
-- Date: 2025-12-18

USE bach_hoa;

-- Drop columns from products table
ALTER TABLE products
    DROP COLUMN weight,
    DROP COLUMN cost_price,
    DROP COLUMN dimensions,
    DROP COLUMN featured,
    DROP COLUMN meta_title,
    DROP COLUMN meta_description;

-- Drop columns from coupons table
ALTER TABLE coupons
    DROP COLUMN applicable_categories,
    DROP COLUMN applicable_products;

-- Drop columns from reviews table
ALTER TABLE reviews
    DROP COLUMN images,
    DROP COLUMN helpful_count,
    DROP COLUMN status;

-- Drop columns from orders table
ALTER TABLE orders
    DROP COLUMN tracking_number;
