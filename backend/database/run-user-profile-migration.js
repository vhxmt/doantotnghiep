import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_NAME || "bach_hoa",
    multipleStatements: true,
  });

  try {
    console.log("🔄 Running migration: add-user-profile-fields.sql");

    // Check if columns already exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'address'"
    );

    if (columns.length > 0) {
      console.log("⚠️  Columns already exist. Skipping migration.");
      return;
    }

    const migrationPath = path.join(
      __dirname,
      "migrations",
      "add-user-profile-fields.sql"
    );
    const sql = await fs.readFile(migrationPath, "utf8");

    // Split and execute each statement separately
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log("✓ Executed:", statement.substring(0, 60) + "...");
      } catch (err) {
        // Ignore duplicate column/index errors
        if (err.errno !== 1060 && err.errno !== 1061) {
          throw err;
        }
        console.log("⚠️  Already exists, skipping...");
      }
    }

    console.log("✅ Migration completed successfully!");
    console.log("Added fields: address, date_of_birth, gender to users table");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
