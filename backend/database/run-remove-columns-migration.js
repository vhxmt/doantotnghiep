import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function runMigration() {
  let connection;

  try {
    console.log("🔄 Connecting to database...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "bach_hoa",
      multipleStatements: true,
    });

    console.log("✅ Connected to database");

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "remove-unused-columns.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("🔄 Running migration: remove-unused-columns.sql");

    await connection.query(migrationSQL);

    console.log("✅ Migration completed successfully!");
    console.log("\n📋 Columns removed:");
    console.log(
      "  - products: weight, cost_price, dimensions, featured, meta_title, meta_description"
    );
    console.log("  - coupons: applicable_categories, applicable_products");
    console.log("  - reviews: images, helpful_count, status");
    console.log("  - orders: tracking_number");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

runMigration();
