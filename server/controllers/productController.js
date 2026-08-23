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
  { _id: "p23", name: "Avocado", description: "Creamy tropical fruit rich in healthy fats", category: "Fruits", price: 160, stock: 18, imageUrl: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p24", name: "Mango", description: "Juicy mangoes for smoothies and desserts", category: "Fruits", price: 150, stock: 24, imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p25", name: "Grapes", description: "Sweet seedless grapes for snacking", category: "Fruits", price: 140, stock: 32, imageUrl: "https://images.unsplash.com/photo-1519996521430-02b4c8744ff0?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p26", name: "Papaya", description: "Soft tropical fruit with a fresh finish", category: "Fruits", price: 130, stock: 21, imageUrl: "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p27", name: "Watermelon", description: "Hydrating summer fruit with juicy flesh", category: "Fruits", price: 110, stock: 27, imageUrl: "https://images.unsplash.com/photo-1629084092232-1d8d9df3f5d2?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p28", name: "Kiwi", description: "Tangy green fruit packed with vitamin C", category: "Fruits", price: 170, stock: 19, imageUrl: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p29", name: "Dragon Fruit", description: "Exotic pink fruit with a mild taste", category: "Fruits", price: 220, stock: 14, imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p30", name: "Peach", description: "Sweet and fragrant orchard peach", category: "Fruits", price: 165, stock: 22, imageUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p31", name: "Orange", description: "Citrus fruit loaded with freshness", category: "Fruits", price: 120, stock: 38, imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p32", name: "Carrot", description: "Crunchy and sweet orange root vegetable", category: "Vegetables", price: 45, stock: 54, imageUrl: "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p33", name: "Spinach", description: "Fresh leafy greens for smoothies and curries", category: "Vegetables", price: 60, stock: 40, imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p34", name: "Cauliflower", description: "Florets perfect for roasting and curries", category: "Vegetables", price: 80, stock: 29, imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p35", name: "Broccoli", description: "Healthy green vegetable with a nutty taste", category: "Vegetables", price: 90, stock: 31, imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p36", name: "Garlic", description: "Fresh bulbs with bold, savory flavor", category: "Vegetables", price: 35, stock: 72, imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p37", name: "Ginger", description: "Aromatic root used in cooking and tea", category: "Vegetables", price: 38, stock: 68, imageUrl: "https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p38", name: "Lemon", description: "Bright, tangy citrus ideal for drinks", category: "Vegetables", price: 42, stock: 58, imageUrl: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p39", name: "Potatoes", description: "Everyday staple for curries and fries", category: "Vegetables", price: 55, stock: 60, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p40", name: "Beetroot", description: "Sweet earthy root with vibrant color", category: "Vegetables", price: 70, stock: 30, imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p41", name: "Pumpkin", description: "Soft and nutrient-rich seasonal vegetable", category: "Vegetables", price: 115, stock: 17, imageUrl: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p42", name: "Green Peas", description: "Sweet and tender peas for healthy meals", category: "Vegetables", price: 85, stock: 33, imageUrl: "https://images.unsplash.com/photo-1592394533822-fd0d36a0d8d0?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p43", name: "Mushroom", description: "Fresh earthy mushrooms for sautéing", category: "Vegetables", price: 120, stock: 23, imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p44", name: "Cilantro", description: "Fresh herb for chutneys, curries, and salads", category: "Vegetables", price: 25, stock: 80, imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p45", name: "Mint", description: "Cooling herb that adds freshness", category: "Vegetables", price: 22, stock: 75, imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p46", name: "Coconut Water", description: "Natural hydration with a light tropical taste", category: "Beverages", price: 80, stock: 35, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p47", name: "Almond Milk", description: "Dairy-free milk for smoothies and cereals", category: "Beverages", price: 140, stock: 20, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p48", name: "Lassi", description: "Refreshing yogurt drink with a sweet finish", category: "Beverages", price: 70, stock: 41, imageUrl: "https://images.unsplash.com/photo-1574170569297-1c4d5b20d87b?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p49", name: "Soya Milk", description: "Plant-based milk with rich protein", category: "Beverages", price: 130, stock: 25, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p50", name: "Mineral Water", description: "Pure bottled water for daily hydration", category: "Beverages", price: 30, stock: 90, imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p51", name: "Yogurt Drink", description: "Classic cultured drink with a tangy taste", category: "Beverages", price: 65, stock: 46, imageUrl: "https://images.unsplash.com/photo-1574170569297-1c4d5b20d87b?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p52", name: "Peanut Butter", description: "Smooth, protein-rich spread for breakfast", category: "Bakery", price: 190, stock: 16, imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p53", name: "Fruit Jam", description: "Classic fruit preserve for toast and desserts", category: "Bakery", price: 110, stock: 28, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p54", name: "Honey", description: "Pure natural honey with a floral finish", category: "Bakery", price: 220, stock: 12, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p55", name: "Pasta", description: "Quick-cook pasta for family meals", category: "Grains", price: 95, stock: 41, imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p56", name: "Vermicelli", description: "Thin noodles for soups and snacks", category: "Grains", price: 85, stock: 44, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p57", name: "Whole Wheat Flour", description: "Protein-rich flour for rotis and breads", category: "Grains", price: 120, stock: 36, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p58", name: "Moong Dal", description: "Light lentils ideal for soups and khichdi", category: "Grains", price: 110, stock: 42, imageUrl: "https://images.unsplash.com/photo-1604908556856-070d352d1b2d?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p59", name: "Chana Dal", description: "Classic split chickpeas with rich protein", category: "Grains", price: 120, stock: 38, imageUrl: "https://images.unsplash.com/photo-1604908556856-070d352d1b2d?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p60", name: "Masoor Dal", description: "Split red lentils for everyday cooking", category: "Grains", price: 105, stock: 40, imageUrl: "https://images.unsplash.com/photo-1604908556856-070d352d1b2d?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p61", name: "Mustard Oil", description: "Traditional cooking oil with a sharp aroma", category: "Household", price: 180, stock: 22, imageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p62", name: "Olive Oil", description: "Pure aromatic oil for healthy cooking", category: "Household", price: 260, stock: 14, imageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p63", name: "Coconut Oil", description: "Versatile oil for cooking and hair care", category: "Household", price: 210, stock: 18, imageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p64", name: "Handwash", description: "Fresh citrus handwash for hygienic cleaning", category: "Household", price: 80, stock: 47, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p65", name: "Floor Cleaner", description: "Effective cleaning solution for hard floors", category: "Household", price: 150, stock: 25, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p66", name: "Laundry Detergent", description: "Gentle but powerful fabric care solution", category: "Household", price: 240, stock: 19, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p67", name: "Bath Soap", description: "Refreshing daily bath bar for all skin types", category: "Household", price: 55, stock: 58, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p68", name: "Dishwashing Liquid", description: "Powerful liquid for sparkling kitchenware", category: "Household", price: 90, stock: 38, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p69", name: "Tissues", description: "Soft tissue boxes for everyday use", category: "Household", price: 60, stock: 67, imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p70", name: "Face Wash", description: "Gentle cleansing wash for fresh skin", category: "Household", price: 170, stock: 21, imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p71", name: "Sanitizer", description: "Portable hand sanitizer for quick protection", category: "Household", price: 110, stock: 32, imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80", isActive: true },
  { _id: "p72", name: "Baby Corn", description: "Tender baby corn for stir-fries and salads", category: "Vegetables", price: 88, stock: 20, imageUrl: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=900&q=80", isActive: true },
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
