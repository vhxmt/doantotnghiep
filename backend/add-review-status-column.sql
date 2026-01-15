-- Add status column to reviews table
-- Run this SQL script in your MySQL database

ALTER TABLE reviews
ADD COLUMN status ENUM('pending', 'approved', 'rejected')
NOT NULL DEFAULT 'approved'
AFTER comment;

-- Optional: Update existing reviews to have approved status (already default)
-- UPDATE reviews SET status = 'approved' WHERE status IS NULL;

SELECT 'Status column added successfully!' as message;
