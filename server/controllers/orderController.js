const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const memoryOrders = global.__miniDmartOrders || (global.__miniDmartOrders = []);

// Helper to resolve valid MongoDB User ID for req.user
const resolveMongoUserId = async (userPayload) => {
  if (userPayload?.id && mongoose.Types.ObjectId.isValid(userPayload.id)) {
    return userPayload.id;
  }
  // If user payload has non-ObjectId (e.g. 'customer-default' or 'staff-default')
  let dbUser = await User.findOne({
    $or: [
      { email: `${userPayload?.role || 'customer'}@minidmart.com` },
      { role: userPayload?.role || 'customer' }
    ]
  });

  if (!dbUser) {
    dbUser = await User.create({
      name: userPayload?.role === "admin" ? "System Admin" : userPayload?.role === "staff" ? "Store Staff" : "Demo Customer",
      email: `${userPayload?.role || "customer"}@minidmart.com`,
      password: `${userPayload?.role || "customer"}@123`,
      role: userPayload?.role || "customer",
    });
  }

  return dbUser._id;
};

exports.createOrder = async (req, res) => {
  try {
    const { items, orderType = "pickup", deliveryAddress = "", notes = "" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    const normalizedItems = [];
    let total = 0;

    if (mongoose.connection.readyState !== 1) {
      const productList = global.__miniDmartProducts || [];

      for (const item of items) {
        const rawId = item.productId || item.product || item._id;
        const rawName = (item.name || "").trim().toLowerCase();

        let product = productList.find(
          (entry) =>
            String(entry._id) === String(rawId) ||
            (rawName && entry.name.toLowerCase() === rawName)
        );

        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found: ${item.name || rawId}` });
        }

        const quantity = Number(item.quantity || 1);
        if (quantity <= 0) {
          return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` });
        }

        if (product.stock < quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
        }

        product.stock -= quantity;
        total += Number(product.price) * quantity;

        normalizedItems.push({
          product: product._id,
          name: product.name,
          price: Number(product.price),
          quantity,
        });
      }

      const newOrder = {
        _id: `order-${Date.now()}`,
        user: req.user.id,
        items: normalizedItems,
        orderType,
        deliveryAddress,
        notes,
        total,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryOrders.push(newOrder);
      return res.status(201).json({ success: true, data: newOrder });
    }

    // MongoDB connected mode
    const userId = await resolveMongoUserId(req.user);

    for (const item of items) {
      const rawId = item.productId || item.product || item._id;
      const rawName = item.name ? String(item.name).trim() : "";

      let product = null;

      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        product = await Product.findById(rawId);
      }

      if (!product && rawName) {
        product = await Product.findOne({ name: new RegExp(`^${rawName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
      }

      // If product not found yet, check memory/demo products array for a name match
      if (!product && (global.__miniDmartProducts || []).length > 0) {
        const memMatch = global.__miniDmartProducts.find(
          (entry) => String(entry._id) === String(rawId) || (rawName && entry.name.toLowerCase() === rawName.toLowerCase())
        );
        if (memMatch) {
          product = await Product.findOne({ name: new RegExp(`^${memMatch.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
          if (!product) {
            product = await Product.create({
              name: memMatch.name,
              description: memMatch.description || memMatch.name,
              category: memMatch.category || "General",
              price: Number(memMatch.price || 100),
              stock: Number(memMatch.stock || 50),
              imageUrl: memMatch.imageUrl || "",
            });
          }
        }
      }

      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${rawName || rawId}` });
      }

      const quantity = Number(item.quantity || 1);
      if (quantity <= 0) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      product.stock -= quantity;
      await product.save();

      const price = Number(product.price);
      total += price * quantity;

      normalizedItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
      });
    }

    const order = await Order.create({
      user: userId,
      items: normalizedItems,
      orderType,
      deliveryAddress,
      notes,
      total,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const orders = memoryOrders.filter((order) => String(order.user) === String(req.user.id));
      return res.status(200).json({ success: true, data: orders });
    }

    let userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      userId = await resolveMongoUserId(req.user);
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).populate("items.product");
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: memoryOrders });
    }

    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email role");
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const index = memoryOrders.findIndex((order) => String(order._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ success: false, message: "Order not found" });
      memoryOrders[index] = { ...memoryOrders[index], status, updatedAt: new Date() };
      return res.status(200).json({ success: true, data: memoryOrders[index] });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

