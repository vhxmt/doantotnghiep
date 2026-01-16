/**
 * Migration script to add ZaloPay payment method and related fields
 * Run: node add-zalopay-payment.js
 */

import sequelize from './src/database/config.js';

async function migrate() {
  try {
    console.log('Starting migration for ZaloPay payment...');

    // 1. Modify payment_method ENUM to include 'zalopay'
    console.log('1. Adding zalopay to payment_method ENUM...');
    await sequelize.query(`
      ALTER TABLE orders
      MODIFY COLUMN payment_method ENUM('cod', 'vnpay', 'stripe', 'zalopay') DEFAULT 'cod'
    `);
    console.log('   ✓ payment_method ENUM updated');

    // 2. Add payment_transaction_id column if not exists
    console.log('2. Adding payment_transaction_id column...');
    try {
      await sequelize.query(`
        ALTER TABLE orders
        ADD COLUMN payment_transaction_id VARCHAR(100) NULL
      `);
      console.log('   ✓ payment_transaction_id column added');
    } catch (err) {
      if (err.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('   - payment_transaction_id column already exists');
      } else {
        throw err;
      }
    }

    // 3. Add paid_at column if not exists
    console.log('3. Adding paid_at column...');
    try {
      await sequelize.query(`
        ALTER TABLE orders
        ADD COLUMN paid_at DATETIME NULL
      `);
      console.log('   ✓ paid_at column added');
    } catch (err) {
      if (err.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('   - paid_at column already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('ZaloPay payment method is now available.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
