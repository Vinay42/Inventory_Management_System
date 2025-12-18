import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db/index.js";

const router = express.Router();

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /* ---- Validation ---- */
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }
    const dbCheck = await pool.query("SELECT current_database()");
console.log("CONNECTED TO DB:", dbCheck.rows[0].current_database);

    /* ---- Check if user exists ---- */
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    /* ---- Hash password ---- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---- Insert user ---- */
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'USER')
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
