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
      { name: "Fresh Apples", description: "Crisp and juicy red apples", category: "Fruits", price: 120, stock: 40, imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80" },
      { name: "Bananas", description: "Naturally sweet, ready to eat", category: "Fruits", price: 60, stock: 50, imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80" },
      { name: "Milk 1L", description: "Farm fresh whole milk", category: "Dairy", price: 70, stock: 30, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80" },
      { name: "Brown Rice", description: "Healthy and filling staple", category: "Grains", price: 110, stock: 25, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80" },
      { name: "Tomatoes", description: "Fresh kitchen staple", category: "Vegetables", price: 80, stock: 35, imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80" },
      { name: "Bread", description: "Soft whole wheat bread", category: "Bakery", price: 55, stock: 22, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80" },
      { name: "Onions", description: "Fresh red onions for daily cooking", category: "Vegetables", price: 40, stock: 60, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80" },
      { name: "Paneer", description: "Soft protein-rich cottage cheese", category: "Dairy", price: 90, stock: 28, imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80" },
      { name: "Basmati Rice", description: "Premium aromatic long-grain rice", category: "Grains", price: 180, stock: 18, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80" },
      { name: "Eggs", description: "Farm fresh eggs, 12 count", category: "Dairy", price: 90, stock: 42, imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80" },
      { name: "Butter", description: "Creamy spread for breakfast and baking", category: "Dairy", price: 120, stock: 24, imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=900&q=80" },
      { name: "Tea", description: "Classic Indian tea leaves", category: "Beverages", price: 95, stock: 50, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80" },
      { name: "Coffee", description: "Rich aroma coffee blend", category: "Beverages", price: 150, stock: 32, imageUrl: "https://images.unsplash.com/photo-1498804103079-a4f1d8dfe2d6?auto=format&fit=crop&w=900&q=80" },
      { name: "Dishwash Bar", description: "Effective kitchen cleaning soap", category: "Household", price: 35, stock: 70, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80" },
      { name: "Toothpaste", description: "Fresh mint flavor oral care", category: "Household", price: 75, stock: 54, imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80" },
      { name: "Red Bell Pepper", description: "Sweet and crunchy for salads and stir-fries", category: "Vegetables", price: 95, stock: 28, imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80" },
      { name: "Strawberries", description: "Sweet red berries packed with vitamin C", category: "Fruits", price: 180, stock: 20, imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80" },
      { name: "Greek Yogurt", description: "Creamy and protein-rich yogurt cups", category: "Dairy", price: 110, stock: 26, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80" },
      { name: "Cucumber", description: "Fresh garden cucumber, hydrating and crisp", category: "Vegetables", price: 50, stock: 48, imageUrl: "https://images.unsplash.com/photo-1449300079323-02e209d1a3f6?auto=format&fit=crop&w=900&q=80" },
      { name: "Cheese Slice", description: "Everyday cheddar slices for sandwiches", category: "Dairy", price: 130, stock: 18, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80" },
      { name: "Oats", description: "Healthy breakfast oats for porridge and baking", category: "Grains", price: 90, stock: 56, imageUrl: "https://images.unsplash.com/photo-1517673400267-3bc8c4d60f0b?auto=format&fit=crop&w=900&q=80" },
      { name: "Sweet Corn", description: "Fresh golden corn kernels for quick meals", category: "Vegetables", price: 72, stock: 44, imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80" },
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
