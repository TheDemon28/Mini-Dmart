const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mini-dmart";
    await mongoose.connect(mongoUri);

    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`Products already exist (${productCount}). No seed needed.`);
      await mongoose.disconnect();
      return;
    }

    const items = [
      { name: "Fresh Apples", description: "Crisp and juicy red apples", category: "Fruits", price: 120, stock: 40, imageUrl: "" },
      { name: "Bananas", description: "Naturally sweet, ready to eat", category: "Fruits", price: 60, stock: 50, imageUrl: "" },
      { name: "Milk 1L", description: "Farm fresh whole milk", category: "Dairy", price: 70, stock: 30, imageUrl: "" },
      { name: "Brown Rice", description: "Healthy and filling staple", category: "Grains", price: 110, stock: 25, imageUrl: "" },
      { name: "Tomatoes", description: "Fresh kitchen staple", category: "Vegetables", price: 80, stock: 35, imageUrl: "" },
      { name: "Bread", description: "Soft whole wheat bread", category: "Bakery", price: 55, stock: 22, imageUrl: "" },
    ];

    const created = await Product.insertMany(items);
    console.log(`Inserted ${created.length} demo products.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed products failed:", error.message);
    process.exit(1);
  }
};

seedProducts();
