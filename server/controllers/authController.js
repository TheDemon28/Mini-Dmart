const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const memoryUsers = global.__miniDmartUsers || (global.__miniDmartUsers = []);

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@minidmart.com").toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const DEFAULT_CUSTOMER_EMAIL = "customer@minidmart.test";
const DEFAULT_CUSTOMER_PASSWORD = "Customer123!";
const LEGACY_ADMIN_PASSWORDS = new Set([DEFAULT_ADMIN_PASSWORD, "admin123", "Admin123", "Admin@123"]);
const LEGACY_CUSTOMER_PASSWORDS = new Set([DEFAULT_CUSTOMER_PASSWORD, "customer123", "Customer123", "customer123!"]);

const getPasswordCandidates = (role, providedPassword) => {
  const candidates = new Set([String(providedPassword || "")]);
  const legacyPasswords = role === "admin" ? LEGACY_ADMIN_PASSWORDS : LEGACY_CUSTOMER_PASSWORDS;

  for (const value of legacyPasswords) {
    candidates.add(value);
  }

  return Array.from(candidates).filter(Boolean);
};

const passwordMatches = async (user, providedPassword) => {
  const candidates = getPasswordCandidates(user.role, providedPassword);

  for (const candidate of candidates) {
    const matches = await bcrypt.compare(candidate, user.password);
    if (matches) return true;
  }

  return false;
};

const ensureMemoryAdmin = () => {
  if (!memoryUsers.some((user) => user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL)) {
    memoryUsers.push({
      _id: "admin-default",
      name: "System Admin",
      email: DEFAULT_ADMIN_EMAIL,
      password: bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10),
      role: "admin",
      isActive: true,
    });
  }

  if (!memoryUsers.some((user) => user.email.toLowerCase() === DEFAULT_CUSTOMER_EMAIL)) {
    memoryUsers.push({
      _id: "customer-default",
      name: "Demo Customer",
      email: DEFAULT_CUSTOMER_EMAIL,
      password: bcrypt.hashSync(DEFAULT_CUSTOMER_PASSWORD, 10),
      role: "customer",
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

      const isMatch = await passwordMatches(user, password);

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

    const isMatch = await passwordMatches(user, password);
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
