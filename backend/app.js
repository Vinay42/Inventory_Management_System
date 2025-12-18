import express from "express";
import cors from "cors";

import authLoginRoutes from "./routes/login.js";
import authSignupRoutes from "./routes/signup.js";
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authLoginRoutes);
app.use("/api/auth", authSignupRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

export default app;
