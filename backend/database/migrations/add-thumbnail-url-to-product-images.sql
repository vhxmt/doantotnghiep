-- Migration: Add thumbnail_url column to product_images table
-- Date: 2025-10-07

USE bach_hoa;

-- Add thumbnail_url column (safe, will skip if exists)
SET @dbname = DATABASE();
SET @tablename = 'product_images';
SET @columnname = 'thumbnail_url';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column exists" AS result;',
  'ALTER TABLE product_images ADD COLUMN thumbnail_url VARCHAR(500) AFTER image_url;'
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Make product_id nullable to allow orphan images before being assigned to a product
ALTER TABLE product_images 
MODIFY COLUMN product_id INT NULL;

-- Add indexes for better query performance (safe, will skip if exists)
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);

SELECT 'Migration completed successfully!' as status;
