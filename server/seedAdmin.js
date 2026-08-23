const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mini-dmart";
    await mongoose.connect(mongoUri);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@minidmart.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    const existing = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existing) {
      console.log(`Admin user already exists: ${existing.email}`);
      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin user created successfully:");
    console.log({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
    console.log("Login with:");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed admin failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
