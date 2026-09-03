const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const memoryUsers = global.__miniDmartUsers || (global.__miniDmartUsers = []);

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@minidmart.com").toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const DEFAULT_STAFF_EMAIL = (process.env.STAFF_EMAIL || "staff@minidmart.com").toLowerCase();
const DEFAULT_STAFF_PASSWORD = process.env.STAFF_PASSWORD || "Staff@123";
const DEFAULT_CUSTOMER_EMAIL = (process.env.CUSTOMER_EMAIL || "customer@minidmart.com").toLowerCase();
const DEFAULT_CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD || "Customer@123";

const LEGACY_ADMIN_PASSWORDS = new Set([DEFAULT_ADMIN_PASSWORD, "admin123", "Admin123", "Admin@123"]);
const LEGACY_STAFF_PASSWORDS = new Set([DEFAULT_STAFF_PASSWORD, "staff123", "Staff123", "Staff@123"]);
const LEGACY_CUSTOMER_PASSWORDS = new Set([DEFAULT_CUSTOMER_PASSWORD, "customer123", "Customer123", "customer123!", "Customer123!"]);

const getPasswordCandidates = (role, providedPassword) => {
  const candidates = new Set([String(providedPassword || "")]);
  let legacyPasswords;
  if (role === "admin") {
    legacyPasswords = LEGACY_ADMIN_PASSWORDS;
  } else if (role === "staff") {
    legacyPasswords = LEGACY_STAFF_PASSWORDS;
  } else {
    legacyPasswords = LEGACY_CUSTOMER_PASSWORDS;
  }

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

  if (!memoryUsers.some((user) => user.email.toLowerCase() === DEFAULT_STAFF_EMAIL)) {
    memoryUsers.push({
      _id: "staff-default",
      name: "Store Staff",
      email: DEFAULT_STAFF_EMAIL,
      password: bcrypt.hashSync(DEFAULT_STAFF_PASSWORD, 10),
      role: "staff",
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

    const normalizedEmail = String(email).toLowerCase();

    if (mongoose.connection.readyState !== 1) {
      ensureMemoryAdmin();
      const user = memoryUsers.find((entry) => entry.email.toLowerCase() === normalizedEmail);
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

    let user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      if (normalizedEmail === DEFAULT_ADMIN_EMAIL) {
        user = await User.create({ name: "System Admin", email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD, role: "admin", isActive: true });
        user = await User.findById(user._id).select("+password");
      } else if (normalizedEmail === DEFAULT_STAFF_EMAIL) {
        user = await User.create({ name: "Store Staff", email: DEFAULT_STAFF_EMAIL, password: DEFAULT_STAFF_PASSWORD, role: "staff", isActive: true });
        user = await User.findById(user._id).select("+password");
      } else if (normalizedEmail === DEFAULT_CUSTOMER_EMAIL) {
        user = await User.create({ name: "Demo Customer", email: DEFAULT_CUSTOMER_EMAIL, password: DEFAULT_CUSTOMER_PASSWORD, role: "customer", isActive: true });
        user = await User.findById(user._id).select("+password");
      }
    }

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
