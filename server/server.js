
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
      console.warn("Warning: MONGO_URI is not set. MongoDB will not connect until set in environment.");
    }

    const connection = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/mini-dmart");

    console.log(`MongoDB connected: ${connection.connection.host}`);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

startServer();