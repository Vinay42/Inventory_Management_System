// import { pool } from "../db/index.js";

// export async function getOrCreateActiveCart(userId) {
//   const existing = await pool.query(
//     `SELECT cart_id FROM user_carts 
//      WHERE user_id=$1 AND status='ACTIVE'`,
//     [userId]
//   );

//   if (existing.rows.length > 0) {
//     return existing.rows[0].cart_id;
//   }

//   const created = await pool.query(
//     `INSERT INTO user_carts (user_id, status)
//      VALUES ($1, 'ACTIVE')
//      RETURNING cart_id`,
//     [userId]
//   );

//   return created.rows[0].cart_id;
// }



// utils/cart.js
export async function getOrCreateActiveCart(client, userId) {
  const existing = await client.query(
    `SELECT cart_id 
     FROM user_carts 
     WHERE user_id = $1 AND status = 'ACTIVE'`,
    [userId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].cart_id;
  }

  const created = await client.query(
    `INSERT INTO user_carts (user_id, status)
     VALUES ($1, 'ACTIVE')
     RETURNING cart_id`,
    [userId]
  );

  return created.rows[0].cart_id;
}
