
require("dotenv").config();

const { Pool } = require("pg");

const useNeon = process.env.USE_NEON?.trim().toLowerCase() === "true";

console.log("Database mode:", useNeon ? "Neon" : "Local PostgreSQL");
console.log("Neon DATABASE_URL configured:", Boolean(process.env.DATABASE_URL));

const pool = useNeon
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
      },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
    });

module.exports = pool;
