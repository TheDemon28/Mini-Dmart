const mongoose = require("mongoose");
const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");

const memoryReturnRequests = global.__miniDmartReturnRequests || (global.__miniDmartReturnRequests = []);

exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, requestedType, reason, itemName } = req.body;

    if (!orderId || !requestedType || !reason) {
      return res.status(400).json({ success: false, message: "Order ID, request type, and reason are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const order = (global.__miniDmartOrders || []).find((entry) => String(entry._id) === String(orderId));
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      const returnRequest = {
        _id: `rr-${Date.now()}`,
        user: req.user.id,
        order: order._id,
        requestedType,
        reason,
        itemName: itemName || "Order item",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryReturnRequests.push(returnRequest);
      return res.status(201).json({ success: true, data: returnRequest });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const request = await ReturnRequest.create({
      user: req.user.id,
      order: orderId,
      requestedType,
      reason,
      itemName: itemName || "Order item",
      status: "pending",
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyReturnRequests = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: memoryReturnRequests.filter((item) => String(item.user) === String(req.user.id)) });
    }

    const requests = await ReturnRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllReturnRequests = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: memoryReturnRequests });
    }

    const requests = await ReturnRequest.find().sort({ createdAt: -1 }).populate("user", "name email role").populate("order");
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const index = memoryReturnRequests.findIndex((item) => String(item._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ success: false, message: "Return request not found" });
      memoryReturnRequests[index] = { ...memoryReturnRequests[index], status, updatedAt: new Date() };
      return res.status(200).json({ success: true, data: memoryReturnRequests[index] });
    }

    const request = await ReturnRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: "Return request not found" });
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
