# 🛒 E-Commerce Inventory, Cart & Checkout System (Backend)

## 📌 Project Description
This project is a **backend-only REST API** for an e-commerce system that supports:

- **User Authentication:** Secure login and registration using JWT
- **Role-Based Access Control:** `ADMIN` and `USER` roles
- **Product Inventory Management:** Create, update, and delete products
- **User Cart Management:** Add/remove items from cart
- **Atomic Checkout:** Prevents overselling using database transactions
- **Dockerized Deployment:** Docker & Docker Compose support
- **PostgreSQL Database:** Relational database storage

The system ensures **data consistency and safety** using **atomic database transactions**.

---

## 🧰 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Containerization:** Docker, Docker Compose
- **Database Driver:** pg
- **Testing:** Postman / curl

---

## 📁 Project Structure
```text
backend/
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   └── checkout.js
├── middleware/
│   └── auth.js
├── utils/
│   └── cart.js
├── db/
│   └── index.js
├── schema.sql
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔐 Environment Variables
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce_db
JWT_SECRET=super-secret-key
```

> ⚠️ Do not commit your `.env` file to GitHub.

---

## 🚀 Setup Instructions (Without Docker)

### 1️⃣ Navigate to backend directory
```bash
cd backend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Start the server
```bash
npm start
```

➡ Backend runs at: **http://localhost:5000**

---

## 🐳 Docker Usage (Recommended)

### 1️⃣ Build & start containers
```bash
docker compose up --build
```

### 2️⃣ Start containers (already built)
```bash
docker compose up
```

---

## 📦 Services

| Service     | URL |
|------------|-----|
| Backend    | http://localhost:5000 |
| PostgreSQL | localhost:5432 |

---

## 🗄️ Database Initialization
- `schema.sql` runs automatically
- Tables and constraints are created
- Default admin user is inserted

---

## 👤 Default Admin Credentials
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

---

## 🔒 Security & Consistency
The checkout process uses **atomic transactions**.

If **any item** in the cart exceeds available stock, the **entire transaction is rolled back**, preventing overselling.

---

## 📬 API Testing
Use **Thunder Client** to test endpoints after starting the server.
<<<<<<< HEAD


=======
>>>>>>> 735d8a30ced6ba699059f72aba575c34daf281b3
