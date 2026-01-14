-- Add additional profile fields to users table
-- Check if columns exist before adding (handled in migration script)

ALTER TABLE users
ADD COLUMN address TEXT;

ALTER TABLE users
ADD COLUMN date_of_birth DATE;

ALTER TABLE users
ADD COLUMN gender ENUM('male', 'female', 'other');

-- Add indexes for better query performance
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);
