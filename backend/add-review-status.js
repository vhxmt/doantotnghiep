import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addReviewStatusColumn() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to database successfully!');

    // Check if status column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM reviews LIKE 'status'"
    );

    if (columns.length > 0) {
      console.log('Status column already exists in reviews table.');
      return;
    }

    // Add status column
    console.log('Adding status column to reviews table...');
    await connection.query(`
      ALTER TABLE reviews
      ADD COLUMN status ENUM('pending', 'approved', 'rejected')
      NOT NULL DEFAULT 'approved'
      AFTER comment
    `);

    console.log('✓ Status column added successfully!');

    // Verify the column was added
    const [newColumns] = await connection.query(
      "SHOW COLUMNS FROM reviews LIKE 'status'"
    );

    if (newColumns.length > 0) {
      console.log('✓ Verified: Status column exists');
      console.log('Column details:', newColumns[0]);
    }

  } catch (error) {
    console.error('Error adding status column:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the migration
addReviewStatusColumn()
  .then(() => {
    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
