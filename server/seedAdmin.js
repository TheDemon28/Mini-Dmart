const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mini-dmart";
    await mongoose.connect(mongoUri);

    const defaultUsers = [
      {
        name: "System Admin",
        email: (process.env.ADMIN_EMAIL || "admin@minidmart.com").toLowerCase(),
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "admin",
        isActive: true,
      },
      {
        name: "Store Staff",
        email: (process.env.STAFF_EMAIL || "staff@minidmart.com").toLowerCase(),
        password: process.env.STAFF_PASSWORD || "Staff@123",
        role: "staff",
        isActive: true,
      },
      {
        name: "Demo Customer",
        email: (process.env.CUSTOMER_EMAIL || "customer@minidmart.com").toLowerCase(),
        password: process.env.CUSTOMER_PASSWORD || "Customer@123",
        role: "customer",
        isActive: true,
      },
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`User already exists: ${existing.email} (${existing.role})`);
      } else {
        const created = await User.create(u);
        console.log(`User created: ${created.email} (${created.role})`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed users failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
