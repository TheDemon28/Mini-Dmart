# 🛒 Mini D-Mart — Full-Stack E-Commerce Application

A feature-rich, full-stack grocery e-commerce web application built using **React.js**, **Node.js/Express**, and **MongoDB Atlas**. Designed to provide a seamless shopping experience for customers while offering comprehensive administrative and order processing controls for store operations.

---

## 🔗 Live Demo & Links

- **Live Frontend (Vercel):** [https://mini-dmart-orcin.vercel.app](https://mini-dmart-orcin.vercel.app)
- **Live Backend API (Render):** [https://mini-dmart-backend-6m9p.onrender.com](https://mini-dmart-backend-6m9p.onrender.com)
- **GitHub Repository:** [https://github.com/TheDemon28/Mini-Dmart](https://github.com/TheDemon28/Mini-Dmart)

## 🔐 Demo Test Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minidmart.com` | `Admin@123` | Full System Access, Product CRUD, Order & Return Management |
| **Staff** | `staff@minidmart.com` | `Staff@123` | Order Fulfillment, Inventory Status, Return Processing |
| **Customer** | `customer@minidmart.com` | `Customer@123` | Store Shopping, Cart, Checkout, Order History, Return Requests |

*Note: New customer accounts can also be created freely via the Registration page.*

---

## ✨ Key Features

### 👤 User & Role-Based Access Control (RBAC)
- **JWT Authentication**: Secure login, registration, and session management.
- **RBAC Security**: Enforced route protection for Customer, Staff, and Admin roles on both frontend and API backend.

### 🛍️ Product Catalog & Search
- **Category Filtering**: Browse products by category (Fruits, Vegetables, Dairy, Bakery, Grains, Beverages, Household).
- **Live Search & Price Filtering**: Instant client-side and server-side filtering.
- **Inventory Stock Badges**: Real-time stock availability indicators.

### 🛒 Cart & Flexible Checkout
- **Cart Management**: Quantity increment/decrement, dynamic total calculations, and item removal.
- **Fulfillment Modes**:
  - **Home Delivery**: Delivery address collection and scheduling.
  - **Store Pickup**: Direct in-store pickup point selection.
  - **Scheduled Pickup**: Custom time-slot allocation.

### 📦 Order & Returns Lifecycle
- **Customer Order Tracking**: Real-time status updates (Pending, Processing, Completed, Cancelled).
- **Return & Exchange Request System**: Customers can submit return/exchange requests for delivered items.
- **Staff Operations Dashboard**: Staff and Admins can update order states and process returns.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js (Vite), JavaScript (ES6+), Modern Vanilla CSS3, React Router DOM |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | MongoDB Atlas (Cloud), Mongoose ORM |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs Password Hashing, CORS |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (DB) |
| **Development Tools** | VS Code, Git, GitHub, Postman |

---

## 📁 Project Architecture

```text
Mini-Dmart/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI Components
│   │   ├── pages/             # App Pages (Shop, Cart, Orders, Admin, etc.)
│   │   ├── App.jsx            # Main Router & Global App State
│   │   └── App.css            # Custom Styling System
│   └── package.json
│
├── server/                     # Node.js Express Backend API
│   ├── controllers/           # Auth, Product, Order & Return Logic
│   ├── middleware/            # JWT Auth & Role Authorization Middleware
│   ├── models/                # Mongoose Database Schemas (User, Product, Order, Return)
│   ├── routes/                # API Route Definitions (/api/auth, /api/products, etc.)
│   ├── seedAdmin.js           # Admin User Seed Script
│   ├── seedProducts.js        # Product Catalog Seed Script
│   ├── server.js              # Server Entry Point & MongoDB Connection
│   └── package.json
│
├── render.yaml                # Render Infrastructure Blueprint
├── DEPLOY_CHECKLIST.md        # Deployment Guide & Checklist
└── README.md                  # Project Documentation
```

---

## 🚀 REST API Endpoints Overview

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` — Register a new customer account
- `POST /api/auth/login` — Login user & return JWT token
- `GET /api/auth/profile` — Get current logged-in user profile *(Protected)*

### Product Routes (`/api/products`)
- `GET /api/products` — Fetch all products (supports category & search query)
- `GET /api/products/:id` — Fetch single product details
- `POST /api/products` — Create new product *(Admin/Staff only)*
- `PUT /api/products/:id` — Update product details *(Admin/Staff only)*
- `DELETE /api/products/:id` — Delete product *(Admin/Staff only)*

### Order Routes (`/api/orders`)
- `POST /api/orders` — Create a new order *(Authenticated)*
- `GET /api/orders/my-orders` — Get logged-in user's order history *(Authenticated)*
- `GET /api/orders` — Fetch all orders *(Admin/Staff only)*
- `PUT /api/orders/:id/status` — Update order status *(Admin/Staff only)*

### Return Routes (`/api/returns`)
- `POST /api/returns` — Submit a return/exchange request *(Authenticated)*
- `GET /api/returns` — List return requests *(Admin/Staff view all, Customer views own)*
- `PUT /api/returns/:id` — Approve or reject return request *(Admin/Staff only)*

---

## 💻 Local Setup & Running

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas cluster URI)

### 1. Clone Repository
```bash
git clone https://github.com/TheDemon28/Mini-Dmart.git
cd Mini-Dmart
```

### 2. Backend Setup
```bash
cd server
npm install

# Create a .env file inside /server
cat <<EOT > .env
PORT=5001
MONGO_URI=mongodb://localhost:27017/mini-dmart
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@minidmart.com
ADMIN_PASSWORD=Admin@123
CLIENT_URL=http://localhost:5173
EOT

# Seed database with initial Admin and Products
npm run seed:admin
npm run seed:products

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal tab
cd client
npm install

# Start development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## ☁️ Deployment Guide

### Deploying Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set **Root Directory** to `server`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Configure Environment Variables on Render: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_URL`, `NODE_ENV=production`.

### Deploying Frontend to Vercel
1. Import repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set Environment Variable: `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com/api`.
4. Deploy!

---

## 🤖 AI Usage Disclosure

In compliance with submission guidelines:
- **Antigravity AI** was utilized as an AI pair-programming assistant during the development of this project.
- Key areas where AI was used: architectural planning, REST API endpoint boilerplate generation, debugging MongoDB schema indices and CORS options, creating deployment configurations (`render.yaml`), and refining technical documentation.
