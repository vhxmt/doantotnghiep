-- Fix product_images table to allow NULL product_id
-- This allows uploading images before assigning to a product

USE bach_hoa;

-- Check current structure
DESCRIBE product_images;

-- Modify product_id to allow NULL
ALTER TABLE product_images 
MODIFY COLUMN product_id INT NULL;

-- Verify the change
DESCRIBE product_images;

SELECT 'product_id is now nullable' AS status;
