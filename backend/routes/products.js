import express from "express";
import { pool } from "../db/index.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ================= GET ALL PRODUCTS ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );

    res.json({ products: result.rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ================= GET PRODUCT BY ID ================= */
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/* ================= CREATE PRODUCT (ADMIN) ================= */
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { item_name, available_qty, price_paise } = req.body;

    if (!item_name || available_qty < 0 || price_paise <= 0) {
      return res.status(400).json({
        error: "Invalid item_name, available_qty, or price_paise",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products (item_name, available_qty, price_paise)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [item_name, available_qty, price_paise]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch {
    res.status(500).json({ error: "Failed to create product" });
  }
});

/* ================= UPDATE PRODUCT (ADMIN) ================= */
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { available_qty, price_paise } = req.body;
    const productId = req.params.id;

    const existing = await pool.query(
      "SELECT available_qty FROM products WHERE id=$1",
      [productId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const newQty =
      available_qty !== undefined
        ? existing.rows[0].available_qty + available_qty
        : existing.rows[0].available_qty;

    const result = await pool.query(
      `
      UPDATE products
      SET available_qty = $1,
          price_paise = COALESCE($2, price_paise),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [newQty, price_paise, productId]
    );

    res.json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch {
    res.status(500).json({ error: "Failed to update product" });
  }
});

/* ================= DELETE PRODUCT (ADMIN) ================= */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id=$1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
