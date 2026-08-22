const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const memoryUsers = global.__miniDmartUsers || (global.__miniDmartUsers = []);

const ensureMemoryAdmin = () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@minidmart.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  if (!memoryUsers.some((user) => user.email.toLowerCase() === adminEmail)) {
    memoryUsers.push({
      _id: "admin-default",
      name: "System Admin",
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      role: "admin",
      isActive: true,
    });
  }
};

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

const findUserByEmail = async (email) => {
  if (mongoose.connection.readyState !== 1) {
    ensureMemoryAdmin();
    return memoryUsers.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
  }

  return User.findOne({ email: String(email).toLowerCase() }).select("+password");
};

const findUserById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryUsers.find((user) => String(user._id) === String(id)) || null;
  }

  return User.findById(id).select("-password");
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const normalizedEmail = String(email).toLowerCase();

    if (mongoose.connection.readyState !== 1) {
      ensureMemoryAdmin();
      const existing = memoryUsers.find((user) => user.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      const newUser = {
        _id: `user-${Date.now()}`,
        name,
        email: normalizedEmail,
        password: bcrypt.hashSync(password, 10),
        role: role || "customer",
        isActive: true,
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        data: {
          user: toPublicUser(newUser),
          token,
        },
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    if (mongoose.connection.readyState !== 1) {
      ensureMemoryAdmin();
      const user = memoryUsers.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        data: {
          user: toPublicUser(user),
          token,
        },
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
