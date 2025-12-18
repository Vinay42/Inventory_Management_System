import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: "postgres",        
  password: "postgres",
  database: "ecommerce_db"
});
