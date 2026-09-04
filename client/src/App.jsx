import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const productImageFallbacks = {
  Fruits: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  Dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80',
  Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  Grains: 'https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80',
  Beverages: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  Household: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
}

const normalizeProductImage = (product) => {
  const rawUrl = typeof product?.imageUrl === 'string' ? product.imageUrl.trim() : ''
  const resolvedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : (productImageFallbacks[product?.category] || productImageFallbacks.Fruits)

  return {
    ...product,
    imageUrl: resolvedUrl,
  }
}

const normalizeProductList = (products = []) => products.map(normalizeProductImage)

// Remove products with blank images and deduplicate by resolved imageUrl
const dedupeProductsByImage = (products = []) => {
  const seen = new Set()
  const out = []
  for (const p of products) {
    const np = normalizeProductImage(p)
    const img = (np.imageUrl || '').trim()
    if (!img) continue // drop blank images
    if (seen.has(img)) continue // drop duplicates by image URL
    seen.add(img)
    out.push(np)
  }
  return out
}

const demoProducts = [
  { _id: 'p1', name: 'Fresh Apples', description: 'Crisp and juicy red apples', category: 'Fruits', price: 120, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p2', name: 'Bananas', description: 'Naturally sweet and healthy', category: 'Fruits', price: 60, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p3', name: 'Milk 1L', description: 'Farm fresh whole milk', category: 'Dairy', price: 70, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p4', name: 'Brown Rice', description: 'Healthy grain staple', category: 'Grains', price: 110, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p5', name: 'Tomatoes', description: 'Fresh kitchen staple', category: 'Vegetables', price: 80, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p6', name: 'Bread', description: 'Soft whole wheat loaf', category: 'Bakery', price: 55, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p7', name: 'Onions', description: 'Fresh red onions for daily cooking', category: 'Vegetables', price: 40, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p8', name: 'Paneer', description: 'Soft protein-rich cottage cheese', category: 'Dairy', price: 90, stock: 28, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p9', name: 'Basmati Rice', description: 'Premium aromatic long-grain rice', category: 'Grains', price: 180, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p10', name: 'Eggs', description: 'Farm fresh eggs, 12 count', category: 'Dairy', price: 90, stock: 42, imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p11', name: 'Butter', description: 'Creamy spread for breakfast and baking', category: 'Dairy', price: 120, stock: 24, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p12', name: 'Tea', description: 'Classic Indian tea leaves', category: 'Beverages', price: 95, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p13', name: 'Coffee', description: 'Rich aroma coffee blend', category: 'Beverages', price: 150, stock: 32, imageUrl: 'https://images.unsplash.com/photo-1498804103079-a4f1d8dfe2d6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p14', name: 'Dishwash Bar', description: 'Effective kitchen cleaning soap', category: 'Household', price: 35, stock: 70, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p15', name: 'Toothpaste', description: 'Fresh mint flavor oral care', category: 'Household', price: 75, stock: 54, imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p16', name: 'Red Bell Pepper', description: 'Sweet and crunchy for salads and stir-fries', category: 'Vegetables', price: 95, stock: 28, imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p17', name: 'Strawberries', description: 'Sweet red berries packed with vitamin C', category: 'Fruits', price: 180, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p18', name: 'Greek Yogurt', description: 'Creamy and protein-rich yogurt cups', category: 'Dairy', price: 110, stock: 26, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p19', name: 'Cucumber', description: 'Fresh garden cucumber, hydrating and crisp', category: 'Vegetables', price: 50, stock: 48, imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d1a3f6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p20', name: 'Cheese Slice', description: 'Everyday cheddar slices for sandwiches', category: 'Dairy', price: 130, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p21', name: 'Oats', description: 'Healthy breakfast oats for porridge and baking', category: 'Grains', price: 90, stock: 56, imageUrl: 'https://images.unsplash.com/photo-1517673400267-3bc8c4d60f0b?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p22', name: 'Sweet Corn', description: 'Fresh golden corn kernels for quick meals', category: 'Vegetables', price: 72, stock: 44, imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p23', name: 'Avocado', description: 'Creamy tropical fruit rich in healthy fats', category: 'Fruits', price: 160, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p24', name: 'Mango', description: 'Juicy mangoes for smoothies and desserts', category: 'Fruits', price: 150, stock: 24, imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p25', name: 'Grapes', description: 'Sweet seedless grapes for snacking', category: 'Fruits', price: 140, stock: 32, imageUrl: 'https://images.unsplash.com/photo-1519996521430-02b4c8744ff0?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p26', name: 'Papaya', description: 'Soft tropical fruit with a fresh finish', category: 'Fruits', price: 130, stock: 21, imageUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p27', name: 'Watermelon', description: 'Hydrating summer fruit with juicy flesh', category: 'Fruits', price: 110, stock: 27, imageUrl: 'https://images.unsplash.com/photo-1629084092232-1d8d9df3f5d2?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p28', name: 'Kiwi', description: 'Tangy green fruit packed with vitamin C', category: 'Fruits', price: 170, stock: 19, imageUrl: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p29', name: 'Dragon Fruit', description: 'Exotic pink fruit with a mild taste', category: 'Fruits', price: 220, stock: 14, imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p30', name: 'Peach', description: 'Sweet and fragrant orchard peach', category: 'Fruits', price: 165, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p31', name: 'Orange', description: 'Citrus fruit loaded with freshness', category: 'Fruits', price: 120, stock: 38, imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p32', name: 'Carrot', description: 'Crunchy and sweet orange root vegetable', category: 'Vegetables', price: 45, stock: 54, imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p33', name: 'Spinach', description: 'Fresh leafy greens for smoothies and curries', category: 'Vegetables', price: 60, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p34', name: 'Cauliflower', description: 'Florets perfect for roasting and curries', category: 'Vegetables', price: 80, stock: 29, imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p35', name: 'Broccoli', description: 'Healthy green vegetable with a nutty taste', category: 'Vegetables', price: 90, stock: 31, imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p36', name: 'Garlic', description: 'Fresh bulbs with bold, savory flavor', category: 'Vegetables', price: 35, stock: 72, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p37', name: 'Ginger', description: 'Aromatic root used in cooking and tea', category: 'Vegetables', price: 38, stock: 68, imageUrl: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p38', name: 'Lemon', description: 'Bright, tangy citrus ideal for drinks', category: 'Vegetables', price: 42, stock: 58, imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p39', name: 'Potatoes', description: 'Everyday staple for curries and fries', category: 'Vegetables', price: 55, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p40', name: 'Beetroot', description: 'Sweet earthy root with vibrant color', category: 'Vegetables', price: 70, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p41', name: 'Pumpkin', description: 'Soft and nutrient-rich seasonal vegetable', category: 'Vegetables', price: 115, stock: 17, imageUrl: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p42', name: 'Green Peas', description: 'Sweet and tender peas for healthy meals', category: 'Vegetables', price: 85, stock: 33, imageUrl: 'https://images.unsplash.com/photo-1592394533822-fd0d36a0d8d0?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p43', name: 'Mushroom', description: 'Fresh earthy mushrooms for sautéing', category: 'Vegetables', price: 120, stock: 23, imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p44', name: 'Cilantro', description: 'Fresh herb for chutneys, curries, and salads', category: 'Vegetables', price: 25, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p45', name: 'Mint', description: 'Cooling herb that adds freshness', category: 'Vegetables', price: 22, stock: 75, imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p46', name: 'Coconut Water', description: 'Natural hydration with a light tropical taste', category: 'Beverages', price: 80, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p47', name: 'Almond Milk', description: 'Dairy-free milk for smoothies and cereals', category: 'Beverages', price: 140, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p48', name: 'Lassi', description: 'Refreshing yogurt drink with a sweet finish', category: 'Beverages', price: 70, stock: 41, imageUrl: 'https://images.unsplash.com/photo-1574170569297-1c4d5b20d87b?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p49', name: 'Soya Milk', description: 'Plant-based milk with rich protein', category: 'Beverages', price: 130, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p50', name: 'Mineral Water', description: 'Pure bottled water for daily hydration', category: 'Beverages', price: 30, stock: 90, imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p51', name: 'Yogurt Drink', description: 'Classic cultured drink with a tangy taste', category: 'Beverages', price: 65, stock: 46, imageUrl: 'https://images.unsplash.com/photo-1574170569297-1c4d5b20d87b?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p52', name: 'Peanut Butter', description: 'Smooth, protein-rich spread for breakfast', category: 'Bakery', price: 190, stock: 16, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p53', name: 'Fruit Jam', description: 'Classic fruit preserve for toast and desserts', category: 'Bakery', price: 110, stock: 28, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p54', name: 'Honey', description: 'Pure natural honey with a floral finish', category: 'Bakery', price: 220, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p55', name: 'Pasta', description: 'Quick-cook pasta for family meals', category: 'Grains', price: 95, stock: 41, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p56', name: 'Vermicelli', description: 'Thin noodles for soups and snacks', category: 'Grains', price: 85, stock: 44, imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p57', name: 'Whole Wheat Flour', description: 'Protein-rich flour for rotis and breads', category: 'Grains', price: 120, stock: 36, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001c8d6?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p58', name: 'Moong Dal', description: 'Light lentils ideal for soups and khichdi', category: 'Grains', price: 110, stock: 42, imageUrl: 'https://images.unsplash.com/photo-1604908556856-070d352d1b2d?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p59', name: 'Chana Dal', description: 'Classic split chickpeas with rich protein', category: 'Grains', price: 120, stock: 38, imageUrl: 'https://images.unsplash.com/photo-1604908556856-070d352d1b2d?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p60', name: 'Masoor Dal', description: 'Split red lentils for everyday cooking', category: 'Grains', price: 105, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1604908556856-070d352d1b2d?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p61', name: 'Mustard Oil', description: 'Traditional cooking oil with a sharp aroma', category: 'Household', price: 180, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p62', name: 'Olive Oil', description: 'Pure aromatic oil for healthy cooking', category: 'Household', price: 260, stock: 14, imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p63', name: 'Coconut Oil', description: 'Versatile oil for cooking and hair care', category: 'Household', price: 210, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p64', name: 'Handwash', description: 'Fresh citrus handwash for hygienic cleaning', category: 'Household', price: 80, stock: 47, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p65', name: 'Floor Cleaner', description: 'Effective cleaning solution for hard floors', category: 'Household', price: 150, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p66', name: 'Laundry Detergent', description: 'Gentle but powerful fabric care solution', category: 'Household', price: 240, stock: 19, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p67', name: 'Bath Soap', description: 'Refreshing daily bath bar for all skin types', category: 'Household', price: 55, stock: 58, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p68', name: 'Dishwashing Liquid', description: 'Powerful liquid for sparkling kitchenware', category: 'Household', price: 90, stock: 38, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p69', name: 'Tissues', description: 'Soft tissue boxes for everyday use', category: 'Household', price: 60, stock: 67, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p70', name: 'Face Wash', description: 'Gentle cleansing wash for fresh skin', category: 'Household', price: 170, stock: 21, imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p71', name: 'Sanitizer', description: 'Portable hand sanitizer for quick protection', category: 'Household', price: 110, stock: 32, imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80' },
  { _id: 'p72', name: 'Baby Corn', description: 'Tender baby corn for stir-fries and salads', category: 'Vegetables', price: 88, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=900&q=80' },
]

const cleanedDemoProducts = dedupeProductsByImage(demoProducts)

const mergeProducts = (...lists) => {
  const map = new Map()

  lists.flat().forEach((product) => {
    if (!product || !product.name) return

    const key = String(product.name).trim().toLowerCase()
    const existing = map.get(key)

    const isMongoId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)

    if (!existing || isMongoId(product._id) || !isMongoId(existing._id)) {
      map.set(key, {
        ...product,
        _id: product._id || key,
        name: product.name,
        category: product.category || 'General',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        imageUrl: product.imageUrl || '',
      })
    }
  })

  return Array.from(map.values())
}

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem('miniDmartAuth') || 'null')
  } catch {
    return null
  }
}

function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('miniDmartCart') || '[]')
  } catch {
    return []
  }
}

function App() {
  const [auth, setAuth] = useState(getStoredAuth)
  const [cart, setCart] = useState(getStoredCart)
  // cleaned demo list: normalized, deduplicated, and without blank images
  const [products, setProducts] = useState(() => cleanedDemoProducts)
  const [orders, setOrders] = useState([])
  const [returnRequests, setReturnRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    localStorage.setItem('miniDmartAuth', JSON.stringify(auth))
  }, [auth])

  useEffect(() => {
    localStorage.setItem('miniDmartCart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (!auth) {
      setOrders([])
      setReturnRequests([])
      return
    }

    loadOrders()
    loadReturnRequests()
  }, [auth])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/products`)
      const payload = await response.json()

          const fallbackProducts = cleanedDemoProducts

      if (payload?.success && Array.isArray(payload.data?.items)) {
        setProducts(normalizeProductList(mergeProducts(fallbackProducts, payload.data.items)))
        return
      }

      if (payload?.success && Array.isArray(payload.data)) {
        setProducts(normalizeProductList(mergeProducts(fallbackProducts, payload.data)))
        return
      }

      setProducts(fallbackProducts)
    } catch {
      setProducts(normalizeProductList(demoProducts))
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    if (!auth?.token) return

    try {
      const endpoint = auth.user.role === 'customer' ? '/orders/my' : '/orders'
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      const payload = await response.json()
      if (payload?.success && Array.isArray(payload.data)) {
        setOrders(payload.data)
      }
    } catch {
      setOrders([])
    }
  }

  const loadReturnRequests = async () => {
    if (!auth?.token) return

    try {
      const endpoint = auth.user.role === 'customer' ? '/returns/my' : '/returns'
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      const payload = await response.json()
      if (payload?.success && Array.isArray(payload.data)) {
        setReturnRequests(payload.data)
      }
    } catch {
      setReturnRequests([])
    }
  }

  const addToCart = (product) => {
    setCart((current) => {
      const existingItem = current.find((item) => item._id === product._id)
      if (existingItem) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock || 99) }
            : item,
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })
    setMessage(`${product.name} added to cart`)
  }

  const updateCartQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item._id !== productId))
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const handleLogin = async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Login failed')
    }

    setAuth({ token: payload.data.token, user: payload.data.user })
    return payload
  }

  const handleRegister = async (payload) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Registration failed')
    }

    setAuth({ token: result.data.token, user: result.data.user })
    return result
  }

  const handleCreateProduct = async (payload) => {
    if (!auth?.token) throw new Error('Login required to create product')

    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Product creation failed')
    }

    await loadProducts()
    return result
  }

  const handleDeleteProduct = async (productId) => {
    if (!auth?.token) throw new Error('Login required')

    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Deletion failed')
    }

    await loadProducts()
    return result
  }

  const handleCheckout = async (checkoutData) => {
    if (!auth?.token) throw new Error('Login required before checkout')

    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        orderType: checkoutData.orderType,
        deliveryAddress: checkoutData.deliveryAddress || '',
        notes: checkoutData.notes || '',
        items: cart.map((item) => ({ productId: item._id, name: item.name, quantity: item.quantity })),
      }),
    })

    const payload = await response.json()
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Checkout failed')
    }

    setCart([])
    setMessage('Order placed successfully')
    if (auth) {
      await loadOrders()
    }
    return payload
  }

  const handleCreateReturnRequest = async (formData) => {
    if (!auth?.token) throw new Error('Login required')

    const response = await fetch(`${API_BASE}/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Return request failed')
    }

    await loadReturnRequests()
    setMessage('Return/exchange request submitted')
    return result
  }

  const handleUpdateReturnStatus = async (id, status) => {
    if (!auth?.token) throw new Error('Login required')

    const response = await fetch(`${API_BASE}/returns/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ status }),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Status update failed')
    }

    await loadReturnRequests()
    return result
  }

  const handleUpdateOrderStatus = async (id, status) => {
    if (!auth?.token) throw new Error('Login required')

    const response = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ status }),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Order update failed')
    }

    await loadOrders()
    return result
  }

  const logout = () => setAuth(null)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-group">
            <Link to="/" className="brand-link">
              <div className="text-logo">
                <span className="logo-mark">●</span>
                <span className="brand-name">miniDmart</span>
              </div>
            </Link>
          </div>

          <nav className="nav">
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to={auth ? '/returns' : '/login'} className="nav-link">My orders</Link>
            {(auth?.user?.role === 'admin' || auth?.user?.role === 'staff') && (
              <Link to="/admin" className="nav-link">Dashboard</Link>
            )}
            <Link to="/cart" className="cart-link">
              Cart
              <span className="cart-count">{cart.length}</span>
            </Link>
            {!auth ? (
              <button type="button" className="sign-in-btn" onClick={() => setShowAuthModal(true)}>
                Sign in
              </button>
            ) : (
              <button type="button" className="sign-in-btn logout-btn" onClick={logout}>
                Logout
              </button>
            )}
          </nav>
        </header>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onSuccess={() => setShowAuthModal(false)}
          />
        )}

        {message && <div className="flash-message">{message}</div>}

        <main className="page-shell">
          <Routes>
            <Route path="/" element={<HomePage products={products} />} />
            <Route
              path="/login"
              element={<LoginPage auth={auth} onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={<RegisterPage auth={auth} onRegister={handleRegister} />}
            />
            <Route
              path="/shop"
              element={
                <ProductsPage
                  products={products}
                  loading={loading}
                  onAddToCart={addToCart}
                  onReload={loadProducts}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  products={products}
                  loading={loading}
                  onAddToCart={addToCart}
                  onReload={loadProducts}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cart={cart}
                  total={total}
                  onUpdateQuantity={updateCartQuantity}
                  onRemove={removeFromCart}
                  auth={auth}
                />
              }
            />
            <Route
              path="/checkout"
              element={<CheckoutPage auth={auth} cart={cart} total={total} onCheckout={handleCheckout} />}
            />
            <Route
              path="/returns"
              element={
                <ReturnsPage
                  auth={auth}
                  orders={orders}
                  returnRequests={returnRequests}
                  onCreateReturnRequest={handleCreateReturnRequest}
                  onUpdateReturnStatus={handleUpdateReturnStatus}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <AdminPage
                  auth={auth}
                  products={products}
                  orders={orders}
                  returnRequests={returnRequests}
                  onCreateProduct={handleCreateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onReload={loadProducts}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onUpdateReturnStatus={handleUpdateReturnStatus}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function HomePage({ products = [] }) {
  const featuredCategories = [
    { name: 'Fruits', icon: '🍎', count: '16 items' },
    { name: 'Vegetables', icon: '🥕', count: '18 items' },
    { name: 'Dairy', icon: '🥛', count: '9 items' },
    { name: 'Bakery', icon: '🥖', count: '6 items' },
  ]

  const bestSellerProducts = (products.length ? products : cleanedDemoProducts).slice(0, 4)

  return (
    <>
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Freshness, on your schedule</span>
          <h1>Groceries that fit your day.</h1>
          <p>Pick up when it suits you or get essentials delivered to your door.</p>
          <div className="cta-row">
            <Link to="/shop" className="primary-btn">
              Browse groceries
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="carrot">
            <span className="leaf leaf-a" />
            <span className="leaf leaf-b" />
            <span className="leaf leaf-c" />
          </div>
        </div>

        <div className="hero-stats">
          <div>
            <strong>30 min</strong>
            <span>pickup slots</span>
          </div>
          <div>
            <strong>Live</strong>
            <span>stock checks</span>
          </div>
          <div>
            <strong>Easy</strong>
            <span>returns & exchanges</span>
          </div>
        </div>
      </div>

      <section className="feature-strip">
        <article className="feature-card">
          <span className="feature-icon">🥬</span>
          <div>
            <h3>Fresh produce</h3>
            <p>Daily-picked fruits and vegetables for home cooking.</p>
          </div>
        </article>
        <article className="feature-card">
          <span className="feature-icon">🚚</span>
          <div>
            <h3>Fast delivery</h3>
            <p>Quick doorstep dispatch across your neighborhood.</p>
          </div>
        </article>
        <article className="feature-card">
          <span className="feature-icon">📦</span>
          <div>
            <h3>Easy returns</h3>
            <p>Simple exchange and return requests for every order.</p>
          </div>
        </article>
      </section>

      <div className="promo-banner-row">
        <article className="promo-banner promo-banner-green">
          <div>
            <span className="feature-kicker">Weekend deal</span>
            <h3>Up to 40% off your weekly essentials.</h3>
          </div>
          <Link to="/shop" className="secondary-btn light-btn">Shop deal</Link>
        </article>

        <article className="promo-banner promo-banner-peach">
          <div>
            <span className="feature-kicker">Fresh arrives</span>
            <h3>New harvest fruit packs delivered daily.</h3>
          </div>
          <Link to="/shop" className="secondary-btn light-btn">Browse now</Link>
        </article>
      </div>

      <section className="home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Fresh picks</span>
            <h2>Shop by category</h2>
          </div>
          <Link to="/shop" className="secondary-btn">Explore all</Link>
        </div>

        <div className="category-grid">
          {featuredCategories.map((category) => (
            <Link key={category.name} to="/shop" className="category-card">
              <span className="category-emoji">{category.icon}</span>
              <div>
                <strong>{category.name}</strong>
                <small>{category.count}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Top sellers</span>
            <h2>Best-selling staples</h2>
          </div>
          <Link to="/shop" className="secondary-btn">View shop</Link>
        </div>

        <div className="best-seller-grid">
          {bestSellerProducts.map((product) => (
            <article key={product._id} className="mini-product-card">
              <img
                src={normalizeProductImage(product).imageUrl}
                alt={product.name}
                className="mini-product-image"
                onError={(event) => {
                  event.currentTarget.src = productImageFallbacks[product.category] || productImageFallbacks.Fruits
                }}
              />
              <div className="mini-product-body">
                <span className="mini-tag">{product.category}</span>
                <h3>{product.name}</h3>
                <div className="mini-meta">
                  <strong>₹{product.price}</strong>
                  <span>{product.stock} left</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function AuthModal({ onClose, onLogin, onSuccess }) {
  const [form, setForm] = useState({
    email: 'staff@minidmart.com',
    password: 'Staff@123',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const applyPreset = (email, password) => {
    setForm({ email, password })
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onLogin(form)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close login form">
          ×
        </button>

        <p className="modal-kicker">WELCOME</p>
        <h2>Sign in to Mini D-Mart</h2>

        <div className="role-preset-bar">
          <span className="preset-label">Quick Demo Fill:</span>
          <button
            type="button"
            className={`preset-btn ${form.email === 'staff@minidmart.com' ? 'active' : ''}`}
            onClick={() => applyPreset('staff@minidmart.com', 'Staff@123')}
          >
            📋 Staff
          </button>
          <button
            type="button"
            className={`preset-btn ${form.email === 'admin@minidmart.com' ? 'active' : ''}`}
            onClick={() => applyPreset('admin@minidmart.com', 'Admin@123')}
          >
            ⚡ Admin
          </button>
          <button
            type="button"
            className={`preset-btn ${form.email === 'customer@minidmart.com' ? 'active' : ''}`}
            onClick={() => applyPreset('customer@minidmart.com', 'Customer@123')}
          >
            🛒 Customer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="staff@minidmart.com"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
            />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="primary-btn submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="demo-credentials-card">
          <p className="demo-title">🔑 Demo Credentials:</p>
          <ul>
            <li><strong>Staff:</strong> staff@minidmart.com | Staff@123</li>
            <li><strong>Admin:</strong> admin@minidmart.com | Admin@123</li>
            <li><strong>Customer:</strong> customer@minidmart.com | Customer@123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function LoginPage({ auth, onLogin }) {
  const [form, setForm] = useState({ email: 'staff@minidmart.com', password: 'Staff@123' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (auth) return <Navigate to="/shop" replace />

  const applyPreset = (email, password) => {
    setForm({ email, password })
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onLogin(form)
      navigate('/shop')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="panel form-panel">
      <h2>Sign In</h2>
      <div className="role-preset-bar" style={{ marginBottom: '16px' }}>
        <span className="preset-label">Quick Demo Fill:</span>
        <button
          type="button"
          className={`preset-btn ${form.email === 'staff@minidmart.com' ? 'active' : ''}`}
          onClick={() => applyPreset('staff@minidmart.com', 'Staff@123')}
        >
          📋 Staff
        </button>
        <button
          type="button"
          className={`preset-btn ${form.email === 'admin@minidmart.com' ? 'active' : ''}`}
          onClick={() => applyPreset('admin@minidmart.com', 'Admin@123')}
        >
          ⚡ Admin
        </button>
        <button
          type="button"
          className={`preset-btn ${form.email === 'customer@minidmart.com' ? 'active' : ''}`}
          onClick={() => applyPreset('customer@minidmart.com', 'Customer@123')}
        >
          🛒 Customer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button type="submit" className="primary-btn full-width">Login</button>
      </form>

      <div className="demo-credentials-card" style={{ marginTop: '20px' }}>
        <p className="demo-title">🔑 Demo Credentials:</p>
        <ul>
          <li><strong>Staff:</strong> staff@minidmart.com | Staff@123</li>
          <li><strong>Admin:</strong> admin@minidmart.com | Admin@123</li>
          <li><strong>Customer:</strong> customer@minidmart.com | Customer@123</li>
        </ul>
      </div>
    </div>
  )
}

function RegisterPage({ auth, onRegister }) {
  const [form, setForm] = useState({ name: 'New Customer', email: '', password: '', role: 'customer' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (auth) return <Navigate to="/shop" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onRegister(form)
      navigate('/shop')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="panel form-panel">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {error && <div className="error-box">{error}</div>}
        <button type="submit" className="primary-btn full-width">Create account</button>
      </form>
    </div>
  )
}

function ProductsPage({ products, loading, onAddToCart, onReload }) {
  const [query, setQuery] = useState('')

  const categories = ['All', ...new Set(products.map((product) => product.category))]
  const [activeCategory, setActiveCategory] = useState('All')

  const visibleProducts = products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    return matchesQuery && matchesCategory
  })

  return (
    <div className="panel">
      <div className="section-header shop-header">
        <div>
          <span className="eyebrow">Browse</span>
          <h2>Trending groceries</h2>
        </div>
        <div className="toolbar-inline">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
          />
          <button type="button" className="secondary-btn" onClick={onReload}>Refresh</button>
        </div>
      </div>

      <div className="shop-feature-banner">
        <div>
          <span className="feature-kicker">Featured picks</span>
          <h3>Fresh essentials for every kitchen</h3>
        </div>
        <button type="button" className="primary-btn small-btn">Shop now</button>
      </div>

      <div className="category-row">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'category-pill active' : 'category-pill'}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article key={product._id} className="product-card">
              <div className="product-visual">
                {normalizeProductImage(product).imageUrl ? (
                  <img
                    src={normalizeProductImage(product).imageUrl}
                    alt={product.name}
                    className="product-image"
                    onError={(event) => {
                      event.currentTarget.src = productImageFallbacks[product.category] || productImageFallbacks.Fruits
                    }}
                  />
                ) : (
                  <div className="product-image placeholder-image">Fresh</div>
                )}
              </div>
              <div className="product-info">
                <div className="product-tag">{product.category}</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="price-row">
                  <strong>₹{product.price}</strong>
                  <span>{product.stock} in stock</span>
                </div>
                <button type="button" className="primary-btn" onClick={() => onAddToCart(product)}>
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function CartPage({ cart, total, onUpdateQuantity, onRemove, auth }) {
  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Your bag</span>
          <h2>Shopping cart</h2>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
        <Link className="primary-btn" to="/shop">Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>₹{item.price} each</p>
                </div>
                <div className="quantity-controls">
                  <button type="button" onClick={() => onUpdateQuantity(item._id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onUpdateQuantity(item._id, 1)}>+</button>
                </div>
                <strong>₹{item.price * item.quantity}</strong>
                <button type="button" className="ghost-btn" onClick={() => onRemove(item._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-bar">
            <div>
              <span>Subtotal</span>
              <strong>₹{total}</strong>
            </div>
            {!auth ? (
              <Link className="primary-btn" to="/login">Login to checkout</Link>
            ) : (
              <Link className="primary-btn" to="/checkout">Proceed to checkout</Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CheckoutPage({ auth, cart, total, onCheckout }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ orderType: 'pickup', deliveryAddress: '', notes: '' })
  const [error, setError] = useState('')

  if (!auth) return <Navigate to="/login" replace />
  if (cart.length === 0) return <Navigate to="/shop" replace />

  const submitCheckout = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onCheckout(form)
      navigate('/shop')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Checkout</span>
          <h2>Confirm your order</h2>
        </div>
      </div>

      <form className="checkout-form" onSubmit={submitCheckout}>
        <label>
          Order type
          <select value={form.orderType} onChange={(event) => setForm({ ...form, orderType: event.target.value })}>
            <option value="pickup">Store pickup</option>
            <option value="delivery">Home delivery</option>
          </select>
        </label>

        {form.orderType === 'delivery' && (
          <label>
            Delivery address
            <textarea
              value={form.deliveryAddress}
              onChange={(event) => setForm({ ...form, deliveryAddress: event.target.value })}
              placeholder="House number, street, city"
            />
          </label>
        )}

        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Any special instructions"
          />
        </label>

        <div className="summary-box">
          <div>
            <span>Items</span>
            <strong>{cart.length}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}
        <button type="submit" className="primary-btn full-width">Place order</button>
      </form>
    </div>
  )
}

function ReturnsPage({ auth, orders, returnRequests, onCreateReturnRequest }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ orderId: '', requestedType: 'return', itemName: '', reason: '' })
  const [error, setError] = useState('')

  if (!auth) return <Navigate to="/login" replace />

  const submitRequest = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onCreateReturnRequest(form)
      setForm({ orderId: '', requestedType: 'return', itemName: '', reason: '' })
      navigate('/shop')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Returns</span>
          <h2>Return / exchange requests</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={submitRequest}>
        <label>
          Order
          <select value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })}>
            <option value="">Choose order</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>Order #{String(order._id).slice(-6)}</option>
            ))}
          </select>
        </label>

        <label>
          Request type
          <select value={form.requestedType} onChange={(event) => setForm({ ...form, requestedType: event.target.value })}>
            <option value="return">Return</option>
            <option value="exchange">Exchange</option>
          </select>
        </label>

        <label>
          Item name
          <input value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} />
        </label>

        <label>
          Reason
          <textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
        </label>

        {error && <div className="error-box">{error}</div>}
        <button type="submit" className="primary-btn full-width">Submit request</button>
      </form>

      <div className="request-list">
        {returnRequests.length === 0 ? (
          <p>No return or exchange requests yet.</p>
        ) : (
          returnRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div>
                <strong>{request.requestedType}</strong>
                <span>{request.itemName || 'Order item'}</span>
              </div>
              <p>{request.reason}</p>
              <small>Status: {request.status}</small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AdminPage({ auth, products, orders, returnRequests, onCreateProduct, onDeleteProduct, onReload, onUpdateOrderStatus, onUpdateReturnStatus }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price: 100,
    stock: 10,
    imageUrl: '',
    isActive: true,
  })
  const [error, setError] = useState('')

  if (!auth || !['admin', 'staff'].includes(auth.user.role)) {
    return <Navigate to="/login" replace />
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onCreateProduct(form)
      setForm({ name: '', description: '', category: 'Vegetables', price: 100, stock: 10, imageUrl: '', isActive: true })
      onReload()
      navigate('/shop')
    } catch (err) {
      setError(err.message)
    }
  }

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered']
  const returnStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed']
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const pendingOrders = orders.filter((order) => order.status !== 'delivered').length
  const lowStockItems = products.filter((product) => Number(product.stock || 0) < 10).length

  return (
    <div className="panel dashboard-panel">
      <div className="section-header dashboard-header">
        <div>
          <span className="eyebrow">Operations</span>
          <h2>Staff & admin dashboard</h2>
        </div>
      </div>

      <div className="stats-box dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-label">Orders</span>
          <strong>{orders.length}</strong>
          <small>{pendingOrders} active</small>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-label">Returns</span>
          <strong>{returnRequests.length}</strong>
          <small>{returnRequests.filter((request) => request.status === 'pending').length} pending</small>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-label">Revenue</span>
          <strong>₹{totalRevenue}</strong>
          <small>{products.length} products</small>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-label">Low stock</span>
          <strong>{lowStockItems}</strong>
          <small>{lowStockItems === 0 ? 'Healthy' : 'Needs attention'}</small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-title-row">
            <h3>Inventory management</h3>
            <span className="pill-badge">{products.length} items</span>
          </div>

          <form onSubmit={submitProduct} className="form-grid admin-form">
            <label>
              Product name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Grains">Grains</option>
                <option value="Household">Household</option>
              </select>
            </label>
            <label>
              Price
              <input
                type="number"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
              />
            </label>
            <label className="full-span">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="primary-btn full-width">Add product</button>
          </form>

          <div className="product-grid admin-grid">
            {products.map((product) => (
              <article key={product._id} className="product-card small-card">
                <div className="product-tag">{product.category}</div>
                <h3>{product.name}</h3>
                <div className="price-row">
                  <strong>₹{product.price}</strong>
                  <span>{product.stock} left</span>
                </div>
                <button type="button" className="ghost-btn" onClick={() => onDeleteProduct(product._id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-title-row">
            <h3>Order lifecycle</h3>
            <span className="pill-badge">{orders.length} today</span>
          </div>
          {orders.length === 0 ? <p>No orders yet.</p> : (
            <div className="stack-list">
              {orders.map((order) => (
                <div key={order._id} className="stack-card">
                  <div className="stack-row">
                    <strong>#{String(order._id).slice(-6)}</strong>
                    <span>{order.orderType}</span>
                  </div>
                  <p>{order.items?.length || 0} items • ₹{order.total}</p>
                  <div className="status-row">
                    {orderStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={order.status === status ? 'status-button active' : 'status-button'}
                        onClick={() => onUpdateOrderStatus(order._id, status)}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-title-row">
            <h3>Return & exchange queue</h3>
            <span className="pill-badge">{returnRequests.length} items</span>
          </div>
          {returnRequests.length === 0 ? <p>No return requests.</p> : (
            <div className="stack-list">
              {returnRequests.map((request) => (
                <div key={request._id} className="stack-card">
                  <div className="stack-row">
                    <strong>{request.requestedType}</strong>
                    <span>{request.status}</span>
                  </div>
                  <p>{request.itemName || 'Item'} • {request.reason}</p>
                  <div className="status-row">
                    {returnStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={request.status === status ? 'status-button active' : 'status-button'}
                        onClick={() => onUpdateReturnStatus(request._id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
