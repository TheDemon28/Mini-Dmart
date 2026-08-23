
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini D-Mart Backend API Server is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini D-Mart API is running",
  });
});

// Auth routes
app.use("/api/auth", require(path.join(__dirname, "routes", "auth")));

// Product routes
app.use("/api/products", require(path.join(__dirname, "routes", "product")));

// Order routes
app.use("/api/orders", require(path.join(__dirname, "routes", "order")));

// Return / exchange routes
app.use("/api/returns", require(path.join(__dirname, "routes", "return")));

// 404 handler for API
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  next();
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("Warning: MONGO_URI is not set. Starting server in demo mode with in-memory fallback.");
    } else {
      const connection = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${connection.connection.host}`);

      try {
        await connection.connection.db.collection("orders").dropIndex("orderNumber_1");
        console.log("Removed stale orderNumber index from orders collection.");
      } catch (error) {
        if (error.code !== 27) {
          console.warn(`Order index cleanup warning: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.warn(`MongoDB connection error: ${error.message}. Continuing with in-memory demo mode.`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();