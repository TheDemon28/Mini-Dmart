const mongoose = require("mongoose");
const Product = require("../models/Product");

const memoryProducts = global.__miniDmartProducts || (global.__miniDmartProducts = [
  { _id: "p1", name: "Fresh Apples", description: "Crisp and juicy red apples", category: "Fruits", price: 120, stock: 40, imageUrl: "", isActive: true },
  { _id: "p2", name: "Bananas", description: "Naturally sweet and healthy", category: "Fruits", price: 60, stock: 50, imageUrl: "", isActive: true },
  { _id: "p3", name: "Milk 1L", description: "Farm fresh whole milk", category: "Dairy", price: 70, stock: 30, imageUrl: "", isActive: true },
  { _id: "p4", name: "Brown Rice", description: "Healthy grain staple", category: "Grains", price: 110, stock: 25, imageUrl: "", isActive: true },
  { _id: "p5", name: "Tomatoes", description: "Fresh kitchen staple", category: "Vegetables", price: 80, stock: 35, imageUrl: "", isActive: true },
  { _id: "p6", name: "Bread", description: "Soft whole wheat loaf", category: "Bakery", price: 55, stock: 22, imageUrl: "", isActive: true },
]);

const getProductsFromStore = () => memoryProducts.filter((product) => product.isActive !== false);

exports.getProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let items = getProductsFromStore();
      if (q) items = items.filter((product) => product.name.toLowerCase().includes(String(q).toLowerCase()));
      if (category) items = items.filter((product) => product.category === category);
      if (minPrice) items = items.filter((product) => Number(product.price) >= Number(minPrice));
      if (maxPrice) items = items.filter((product) => Number(product.price) <= Number(maxPrice));

      const pageNumber = Number(page) || 1;
      const pageLimit = Number(limit) || 20;
      const startIndex = (pageNumber - 1) * pageLimit;
      const paginated = items.slice(startIndex, startIndex + pageLimit);

      return res.status(200).json({
        success: true,
        data: { items: paginated, total: items.length, page: pageNumber, limit: pageLimit },
      });
    }

    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = memoryProducts.find((item) => String(item._id) === String(req.params.id));
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      return res.status(200).json({ success: true, data: product });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, imageUrl, stock, isActive } = req.body;
    if (!name || !description || !category || price == null) {
      return res.status(400).json({ success: false, message: "Missing required product fields" });
    }

    if (mongoose.connection.readyState !== 1) {
      const product = {
        _id: `p-${Date.now()}`,
        name,
        description,
        category,
        price: Number(price),
        imageUrl: imageUrl || "",
        stock: Number(stock || 0),
        isActive: isActive !== false,
      };
      memoryProducts.push(product);
      return res.status(201).json({ success: true, data: product });
    }

    const product = await Product.create({ name, description, category, price, imageUrl, stock, isActive });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;

    if (mongoose.connection.readyState !== 1) {
      const index = memoryProducts.findIndex((item) => String(item._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ success: false, message: "Product not found" });
      memoryProducts[index] = { ...memoryProducts[index], ...updates };
      return res.status(200).json({ success: true, data: memoryProducts[index] });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = memoryProducts.findIndex((item) => String(item._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ success: false, message: "Product not found" });
      memoryProducts.splice(index, 1);
      return res.status(200).json({ success: true, message: "Product deleted" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
