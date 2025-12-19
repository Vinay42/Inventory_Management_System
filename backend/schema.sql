-- =========================================
-- E-Commerce Inventory & Cart System Schema
-- Backend-controlled security (NO RLS)
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- PRODUCTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  available_qty INTEGER NOT NULL DEFAULT 0 CHECK (available_qty >= 0),
  price_paise INTEGER NOT NULL CHECK (price_paise > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products
ADD CONSTRAINT unique_item_name UNIQUE (item_name);
-- =====================
-- USER CARTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS user_carts (
  cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- USER CART ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS user_cart_items (
  cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES user_carts(cart_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

-- =====================
-- INDEXES (PERFORMANCE)
-- =====================
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_user_carts_user_id
  ON user_carts(user_id);

CREATE INDEX IF NOT EXISTS idx_user_carts_status
  ON user_carts(status);

CREATE INDEX IF NOT EXISTS idx_user_cart_items_cart_id
  ON user_cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_user_cart_items_product_id
  ON user_cart_items(product_id);

-- =====================
-- DEFAULT ADMIN USER
-- =====================
-- Email: admin@example.com
-- Password: Admin@123
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'System Admin',
  'admin@example.com',
  '$2b$10$bJeOJ8KtMKG8ag6xVgJi2ueXIuNQvROK5TptGlOF9f7wH.MAiOWRW',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
