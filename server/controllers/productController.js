const mongoose = require("mongoose");
const Product = require("../models/Product");

const memoryProducts = global.__miniDmartProducts || (global.__miniDmartProducts = [
  { _id: "p1", name: "Fresh Apples", description: "Crisp and juicy red apples", category: "Fruits", price: 120, stock: 40, imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p2", name: "Bananas", description: "Naturally sweet and healthy", category: "Fruits", price: 60, stock: 50, imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p3", name: "Milk 1L", description: "Farm fresh whole milk", category: "Dairy", price: 70, stock: 30, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p4", name: "Brown Rice", description: "Healthy grain staple", category: "Grains", price: 110, stock: 25, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p5", name: "Tomatoes", description: "Fresh kitchen staple", category: "Vegetables", price: 80, stock: 35, imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p6", name: "Bread", description: "Soft whole wheat loaf", category: "Bakery", price: 55, stock: 22, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p7", name: "Onions", description: "Fresh red onions for daily cooking", category: "Vegetables", price: 40, stock: 60, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p8", name: "Paneer", description: "Soft protein-rich cottage cheese", category: "Dairy", price: 90, stock: 28, imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p9", name: "Basmati Rice", description: "Premium aromatic long-grain rice", category: "Grains", price: 180, stock: 18, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p10", name: "Eggs", description: "Farm fresh eggs, 12 count", category: "Dairy", price: 90, stock: 42, imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p11", name: "Butter", description: "Creamy spread for breakfast and baking", category: "Dairy", price: 120, stock: 24, imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p12", name: "Tea", description: "Classic Indian tea leaves", category: "Beverages", price: 95, stock: 50, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p13", name: "Coffee", description: "Rich aroma coffee blend", category: "Beverages", price: 150, stock: 32, imageUrl: "https://images.unsplash.com/photo-1498804103079-a4f1d8dfe2d6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p14", name: "Dishwash Bar", description: "Effective kitchen cleaning soap", category: "Household", price: 35, stock: 70, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p15", name: "Toothpaste", description: "Fresh mint flavor oral care", category: "Household", price: 75, stock: 54, imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p16", name: "Red Bell Pepper", description: "Sweet and crunchy for salads and stir-fries", category: "Vegetables", price: 95, stock: 28, imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p17", name: "Strawberries", description: "Sweet red berries packed with vitamin C", category: "Fruits", price: 180, stock: 20, imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p18", name: "Greek Yogurt", description: "Creamy and protein-rich yogurt cups", category: "Dairy", price: 110, stock: 26, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p19", name: "Cucumber", description: "Fresh garden cucumber, hydrating and crisp", category: "Vegetables", price: 50, stock: 48, imageUrl: "https://images.unsplash.com/photo-1449300079323-02e209d1a3f6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p20", name: "Cheese Slice", description: "Everyday cheddar slices for sandwiches", category: "Dairy", price: 130, stock: 18, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p21", name: "Oats", description: "Healthy breakfast oats for porridge and baking", category: "Grains", price: 90, stock: 56, imageUrl: "https://images.unsplash.com/photo-1517673400267-3bc8c4d60f0b?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p22", name: "Sweet Corn", description: "Fresh golden corn kernels for quick meals", category: "Vegetables", price: 72, stock: 44, imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80", isActive: true },
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
