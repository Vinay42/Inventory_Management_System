import express from "express";
import { pool } from "../db/index.js";
import { verifyToken, requireUser } from "../middleware/auth.js";

const router = express.Router();

/* ================= CHECKOUT ================= */
router.post("/", verifyToken, requireUser, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* ---- Get active cart ---- */
    const cartRes = await client.query(
      `SELECT cart_id 
       FROM user_carts 
       WHERE user_id=$1 AND status='ACTIVE'`,
      [req.user.userId]
    );

    if (cartRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "No active cart found" });
    }

    const cartId = cartRes.rows[0].cart_id;

    /* ---- Get cart items ---- */
    const itemsRes = await client.query(
      `
      SELECT
        ci.qty,
        p.id AS product_id,
        p.item_name,
        p.price_paise,
        p.available_qty
      FROM user_cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      `,
      [cartId]
    );

    if (itemsRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    /* ---- Stock validation ---- */
    for (const item of itemsRes.rows) {
      if (item.available_qty < item.qty) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Insufficient stock for ${item.item_name}`,
        });
      }
    }

    /* ---- Create bill ---- */
    const billItems = [];
    let totalAmount = 0;

    for (const item of itemsRes.rows) {
      const total = item.qty * item.price_paise;
      totalAmount += total;

      billItems.push({
        item_name: item.item_name,
        quantity: item.qty,
        price_paise: item.price_paise,
        total_paise: total,
      });

      // Reduce stock
      await client.query(
        `UPDATE products
         SET available_qty = available_qty - $1
         WHERE id = $2`,
        [item.qty, item.product_id]
      );
    }

    /* ---- Close cart ---- */
    await client.query(
      `UPDATE user_carts
       SET status='COMPLETED', updated_at=NOW()
       WHERE cart_id=$1`,
      [cartId]
    );

    /* ---- Clear cart items ---- */
    await client.query(
      "DELETE FROM user_cart_items WHERE cart_id=$1",
      [cartId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Checkout successful",
      bill: {
        cart_id: cartId,
        items: billItems,
        total_amount_paise: totalAmount,
        checkout_date: new Date().toISOString(),
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: "Checkout failed" });
  } finally {
    client.release();
  }
});

export default router;
