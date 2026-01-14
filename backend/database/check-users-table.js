import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function checkUsersTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_NAME || "bach_hoa",
  });

  try {
    console.log("📋 Checking users table structure...\n");

    const [columns] = await connection.query("SHOW COLUMNS FROM users");

    console.log("Columns in users table:");
    columns.forEach((col) => {
      console.log(`  - ${col.Field.padEnd(30)} ${col.Type}`);
    });

    console.log("\n🔍 Checking for profile fields:");
    const profileFields = ["address", "date_of_birth", "gender"];
    profileFields.forEach((field) => {
      const exists = columns.some((col) => col.Field === field);
      console.log(`  ${exists ? "✓" : "✗"} ${field}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkUsersTable();
