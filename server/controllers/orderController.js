const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

const memoryOrders = global.__miniDmartOrders || (global.__miniDmartOrders = []);

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
        const product = productList.find((entry) => String(entry._id) === String(item.productId || item.product));
        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found: ${item.productId || item.product}` });
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

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId || item.product}` });
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
      user: req.user.id,
      items: normalizedItems,
      orderType,
      deliveryAddress,
      notes,
      total,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const orders = memoryOrders.filter((order) => String(order.user) === String(req.user.id));
      return res.status(200).json({ success: true, data: orders });
    }

    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("items.product");
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
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
    console.error(err);
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

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
