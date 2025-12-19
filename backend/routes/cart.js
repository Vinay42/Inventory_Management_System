// import express from "express";
// import { pool } from "../db/index.js";
// import { verifyToken, requireUser } from "../middleware/auth.js";
// import { getOrCreateActiveCart } from "../utils/cart.js";

// const router = express.Router();

// /* ================= GET CART ================= */
// router.get("/", verifyToken, requireUser, async (req, res) => {
//   try {
//     console.debug("GET CART - userId:", req.user.userId);
//     const cartId = await getOrCreateActiveCart(pool,req.user.userId);
//     console.debug("GET CART - cartId:", cartId);

//     const result = await pool.query(
//       `
//       SELECT
//         ci.cart_item_id,
//         ci.qty,
//         p.id AS product_id,
//         p.item_name,
//         p.price_paise,
//         p.available_qty
//       FROM user_cart_items ci
//       JOIN products p ON p.id = ci.product_id
//       WHERE ci.cart_id = $1
//       `,
//       [cartId]
//     );
//     console.debug("GET CART - result rows:", result.rows.length);

//     const items = result.rows.map((item) => ({
//       cart_item_id: item.cart_item_id,
//       product_id: item.product_id,
//       item_name: item.item_name,
//       quantity: item.qty,
//       price_paise: item.price_paise,
//       total_paise: item.qty * item.price_paise,
//       available_qty: item.available_qty,
//     }));

//     const totalAmount = items.reduce(
//       (sum, i) => sum + i.total_paise,
//       0
//     );

//     res.json({
//       cart_id: cartId,
//       items,
//       total_items: items.length,
//       total_amount_paise: totalAmount,
//     });
//   } catch (err) {
//     console.error("FETCH CART ERROR:", err);
//     res.status(500).json({ error: "Failed to fetch cart" });
//   }
// });

// /* ================= ADD ITEM ================= */
// // router.post("/add", verifyToken, requireUser, async (req, res) => {
// //   try {
// //     const { product_id, qty } = req.body;

// //     if (!product_id || !qty || qty <= 0) {
// //       return res.status(400).json({
// //         error: "product_id and positive qty are required",
// //       });
// //     }

// //     const productRes = await pool.query(
// //       "SELECT available_qty FROM products WHERE id=$1",
// //       [product_id]
// //     );

// //     if (productRes.rows.length === 0) {
// //       return res.status(404).json({ error: "Product not found" });
// //     }

// //     const availableQty = productRes.rows[0].available_qty;
// //     const cartId = await getOrCreateActiveCart(req.user.userId);

// //     const existing = await pool.query(
// //       `SELECT cart_item_id, qty 
// //        FROM user_cart_items 
// //        WHERE cart_id=$1 AND product_id=$2`,
// //       [cartId, product_id]
// //     );
    

// //     if (existing.rows.length > 0) {
// //       const newQty = existing.rows[0].qty + qty;
// //       if (newQty > availableQty) {
// //         return res.status(400).json({ error: "Stock exceeded" });
// //       }

// //       await pool.query(
// //         `UPDATE user_cart_items 
// //          SET qty=$1, updated_at=NOW()
// //          WHERE cart_item_id=$2`,
// //         [newQty, existing.rows[0].cart_item_id]
// //       );

// //       return res.json({ message: "Cart item updated" });
// //     }
    
// // if (qty > availableQty) {
// //   return res.status(400).json({ error: "Stock exceeded" });
// // }

// //     await pool.query(
// //       `INSERT INTO user_cart_items (cart_id, product_id, qty)
// //        VALUES ($1,$2,$3)`,
// //       [cartId, product_id, qty]
// //     );

// //     res.status(201).json({ message: "Item added to cart" });
// //   } catch (err) {
// //   console.error("ADD CART ERROR:", err);
// //   res.status(500).json({ error: err.message });
// // }

// // });

// /* ================= ADD ITEM ================= */
// router.post("/add", verifyToken, requireUser, async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const { product_id, qty } = req.body;

//     if (!product_id || !qty || qty <= 0) {
//       return res.status(400).json({
//         error: "product_id and positive qty are required",
//       });
//     }

//     await client.query("BEGIN");

//     // 🔒 Lock product row
//     const productRes = await client.query(
//       `SELECT available_qty 
//        FROM products 
//        WHERE id = $1
//        FOR UPDATE`,
//       [product_id]
//     );

//     if (productRes.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ error: "Product not found" });
//     }

//     const availableQty = productRes.rows[0].available_qty;

//     const cartId = await getOrCreateActiveCart(client, req.user.userId);

//     const existing = await client.query(
//       `SELECT cart_item_id, qty
//        FROM user_cart_items
//        WHERE cart_id = $1 AND product_id = $2`,
//       [cartId, product_id]
//     );

//     if (existing.rows.length > 0) {
//       const newQty = existing.rows[0].qty + qty;

//       if (newQty > availableQty) {
//         await client.query("ROLLBACK");
//         return res.status(400).json({ error: "Stock exceeded" });
//       }

//       await client.query(
//         `UPDATE user_cart_items
//          SET qty = $1, updated_at = NOW()
//          WHERE cart_item_id = $2`,
//         [newQty, existing.rows[0].cart_item_id]
//       );
//     } else {
//       if (qty > availableQty) {
//         await client.query("ROLLBACK");
//         return res.status(400).json({ error: "Stock exceeded" });
//       }

//       await client.query(
//         `INSERT INTO user_cart_items (cart_id, product_id, qty)
//          VALUES ($1, $2, $3)`,
//         [cartId, product_id, qty]
//       );
//     }

//     await client.query("COMMIT");

//     res.status(201).json({ message: "Item added to cart" });

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("ADD CART ERROR:", err);
//     res.status(500).json({ error: "Failed to add item" });
//   } finally {
//     client.release();
//   }
// });


// /* ================= REMOVE ITEM ================= */
// router.post("/remove", verifyToken, requireUser, async (req, res) => {
//   try {
//     const { product_id, qty } = req.body;
//     console.debug("REMOVE CART - userId:", req.user.userId, "body:", { product_id, qty });

//     const cartId = await getOrCreateActiveCart(pool, req.user.userId);
//     console.debug("REMOVE CART - cartId:", cartId);

//     const existing = await pool.query(
//       `SELECT cart_item_id, qty 
//        FROM user_cart_items 
//        WHERE cart_id=$1 AND product_id=$2`,
//       [cartId, product_id]
//     );
//     console.debug("REMOVE CART - existing rows:", existing.rows.length, "existing:", existing.rows);

//     if (existing.rows.length === 0) {
//       return res.status(404).json({ error: "Item not found in cart" });
//     }

//     if (qty >= existing.rows[0].qty) {
//       await pool.query(
//         "DELETE FROM user_cart_items WHERE cart_item_id=$1",
//         [existing.rows[0].cart_item_id]
//       );
//       return res.json({ message: "Item removed from cart" });
//     }

//     await pool.query(
//       `UPDATE user_cart_items 
//        SET qty=$1, updated_at=NOW()
//        WHERE cart_item_id=$2`,
//       [existing.rows[0].qty - qty, existing.rows[0].cart_item_id]
//     );

//     res.json({ message: "Cart item updated" });
//   } catch (err) {
//     console.error("REMOVE CART ERROR:", err);
//     res.status(500).json({ error: "Failed to update cart" });
//   }
// });

// /* ================= REMOVE ITEM ================= */
// // router.post("/remove", verifyToken, requireUser, async (req, res) => {
// //   try {
// //     const { product_id, qty } = req.body;

// //     if (!product_id || !qty || qty <= 0) {
// //       return res.status(400).json({
// //         error: "product_id and positive qty are required",
// //       });
// //     }

// //     const cartId = await getOrCreateActiveCart(req.user.userId);

// //     const existing = await pool.query(
// //       `SELECT cart_item_id, qty 
// //        FROM user_cart_items 
// //        WHERE cart_id = $1 AND product_id = $2`,
// //       [cartId, product_id]
// //     );

// //     if (existing.rows.length === 0) {
// //       return res.status(404).json({
// //         error: "Item not found in cart",
// //       });
// //     }

// //     const cartQty = existing.rows[0].qty;

// //     // ❌ Cannot remove more than exists
// //     if (qty > cartQty) {
// //       return res.status(400).json({
// //         error: "Remove quantity exceeds cart quantity",
// //       });
// //     }

// //     // ✅ Remove entire item
// //     if (qty === cartQty) {
// //       await pool.query(
// //         `DELETE FROM user_cart_items WHERE cart_item_id = $1`,
// //         [existing.rows[0].cart_item_id]
// //       );

// //       return res.json({
// //         message: "Item removed from cart",
// //       });
// //     }

// //     // ✅ Partial remove
// //     await pool.query(
// //       `UPDATE user_cart_items
// //        SET qty = $1, updated_at = NOW()
// //        WHERE cart_item_id = $2`,
// //       [cartQty - qty, existing.rows[0].cart_item_id]
// //     );

// //     return res.json({
// //       message: "Cart item quantity updated",
// //     });

// //   } catch (err) {
// //     console.error("REMOVE CART ERROR:", err);
// //     res.status(500).json({ error: "Failed to update cart" });
// //   }
// // });


// export default router;
    


import express from "express";
import { pool } from "../db/index.js";
import { verifyToken, requireUser } from "../middleware/auth.js";
import { getOrCreateActiveCart } from "../utils/cart.js";

const router = express.Router();

/* ================= GET CART ================= */
router.get("/", verifyToken, requireUser, async (req, res) => {
  try {
    console.debug("GET CART - userId:", req.user.userId);
    const cartId = await getOrCreateActiveCart(pool, req.user.userId);
    console.debug("GET CART - cartId:", cartId);

    const result = await pool.query(
      `
      SELECT
        ci.cart_item_id,
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
    console.debug("GET CART - result rows:", result.rows.length);

    const items = result.rows.map((item) => ({
      cart_item_id: item.cart_item_id,
      product_id: item.product_id,
      item_name: item.item_name,
      quantity: item.qty,
      price_paise: item.price_paise,
      total_paise: item.qty * item.price_paise,
      available_qty: item.available_qty,
    }));

    const totalAmount = items.reduce(
      (sum, i) => sum + i.total_paise,
      0
    );

    res.json({
      cart_id: cartId,
      items,
      total_items: items.length,
      total_amount_paise: totalAmount,
    });
  } catch (err) {
    console.error("FETCH CART ERROR:", err);
    res.status(500).json({ error: "Failed to fetch cart", details: err.message });
  }
});

/* ================= ADD ITEM ================= */
router.post("/add", verifyToken, requireUser, async (req, res) => {
  const client = await pool.connect();

  try {
    const { product_id, qty } = req.body;

    if (!product_id || !qty || qty <= 0) {
      client.release();
      return res.status(400).json({
        error: "product_id and positive qty are required",
      });
    }

    await client.query("BEGIN");

    // 🔒 Lock product row
    const productRes = await client.query(
      `SELECT available_qty 
       FROM products 
       WHERE id = $1
       FOR UPDATE`,
      [product_id]
    );

    if (productRes.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(404).json({ error: "Product not found" });
    }

    const availableQty = productRes.rows[0].available_qty;

    const cartId = await getOrCreateActiveCart(client, req.user.userId);

    const existing = await client.query(
      `SELECT cart_item_id, qty
       FROM user_cart_items
       WHERE cart_id = $1 AND product_id = $2`,
      [cartId, product_id]
    );

    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].qty + qty;

      if (newQty > availableQty) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({ error: "Stock exceeded" });
      }

      await client.query(
        `UPDATE user_cart_items
         SET qty = $1, updated_at = NOW()
         WHERE cart_item_id = $2`,
        [newQty, existing.rows[0].cart_item_id]
      );
    } else {
      if (qty > availableQty) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({ error: "Stock exceeded" });
      }

      await client.query(
        `INSERT INTO user_cart_items (cart_id, product_id, qty)
         VALUES ($1, $2, $3)`,
        [cartId, product_id, qty]
      );
    }

    await client.query("COMMIT");
    client.release();

    res.status(201).json({ message: "Item added to cart" });

  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    console.error("ADD CART ERROR:", err);
    res.status(500).json({ error: "Failed to add item", details: err.message });
  }
});

/* ================= REMOVE ITEM ================= */
router.post("/remove", verifyToken, requireUser, async (req, res) => {
  try {
    const { product_id, qty } = req.body;
    console.debug("REMOVE CART - userId:", req.user.userId, "body:", { product_id, qty });

    if (!product_id || !qty || qty <= 0) {
      return res.status(400).json({
        error: "product_id and positive qty are required",
      });
    }

    const cartId = await getOrCreateActiveCart(pool, req.user.userId);
    console.debug("REMOVE CART - cartId:", cartId);

    const existing = await pool.query(
      `SELECT cart_item_id, qty 
       FROM user_cart_items 
       WHERE cart_id=$1 AND product_id=$2`,
      [cartId, product_id]
    );
    console.debug("REMOVE CART - existing rows:", existing.rows.length, "existing:", existing.rows);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (qty >= existing.rows[0].qty) {
      await pool.query(
        "DELETE FROM user_cart_items WHERE cart_item_id=$1",
        [existing.rows[0].cart_item_id]
      );
      return res.json({ message: "Item removed from cart" });
    }

    await pool.query(
      `UPDATE user_cart_items 
       SET qty=$1, updated_at=NOW()
       WHERE cart_item_id=$2`,
      [existing.rows[0].qty - qty, existing.rows[0].cart_item_id]
    );

    res.json({ message: "Cart item updated" });
  } catch (err) {
    console.error("REMOVE CART ERROR:", err);
    res.status(500).json({ error: "Failed to update cart", details: err.message });
  }
});

export default router;