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
      { name: "Onions", description: "Fresh red onions for daily cooking", category: "Vegetables", price: 40, stock: 60, imageUrl: "" },
      { name: "Paneer", description: "Soft protein-rich cottage cheese", category: "Dairy", price: 90, stock: 28, imageUrl: "" },
      { name: "Basmati Rice", description: "Premium aromatic long-grain rice", category: "Grains", price: 180, stock: 18, imageUrl: "" },
      { name: "Eggs", description: "Farm fresh eggs, 12 count", category: "Dairy", price: 90, stock: 42, imageUrl: "" },
      { name: "Butter", description: "Creamy spread for breakfast and baking", category: "Dairy", price: 120, stock: 24, imageUrl: "" },
      { name: "Tea", description: "Classic Indian tea leaves", category: "Beverages", price: 95, stock: 50, imageUrl: "" },
      { name: "Coffee", description: "Rich aroma coffee blend", category: "Beverages", price: 150, stock: 32, imageUrl: "" },
      { name: "Dishwash Bar", description: "Effective kitchen cleaning soap", category: "Household", price: 35, stock: 70, imageUrl: "" },
      { name: "Toothpaste", description: "Fresh mint flavor oral care", category: "Household", price: 75, stock: 54, imageUrl: "" },
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
