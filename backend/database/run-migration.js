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
    console.log(
      "🔄 Running migration: add-thumbnail-url-to-product-images.sql"
    );

    const migrationPath = path.join(
      __dirname,
      "migrations",
      "add-thumbnail-url-to-product-images.sql"
    );
    const sql = await fs.readFile(migrationPath, "utf8");

    const [results] = await connection.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log(results);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
