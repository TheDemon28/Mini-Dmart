import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const demoProducts = [
  { _id: 'p1', name: 'Fresh Apples', description: 'Crisp and juicy red apples', category: 'Fruits', price: 120, stock: 40 },
  { _id: 'p2', name: 'Bananas', description: 'Naturally sweet and healthy', category: 'Fruits', price: 60, stock: 50 },
  { _id: 'p3', name: 'Milk 1L', description: 'Farm fresh whole milk', category: 'Dairy', price: 70, stock: 30 },
  { _id: 'p4', name: 'Brown Rice', description: 'Healthy grain staple', category: 'Grains', price: 110, stock: 25 },
  { _id: 'p5', name: 'Tomatoes', description: 'Fresh kitchen staple', category: 'Vegetables', price: 80, stock: 35 },
  { _id: 'p6', name: 'Bread', description: 'Soft whole wheat loaf', category: 'Bakery', price: 55, stock: 22 },
]

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
  const [products, setProducts] = useState(demoProducts)
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
      if (payload?.success && Array.isArray(payload.data?.items)) {
        setProducts(payload.data.items)
      }
    } catch {
      setProducts(demoProducts)
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
        items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })),
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
            <div className="text-logo">
              <span className="logo-mark">●</span>
              <span className="brand-name">miniDmart</span>
            </div>
          </div>

          <nav className="nav">
            <Link to="/products" className="nav-link">Shop</Link>
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
            <Route path="/" element={<HomePage onOpenLogin={() => setShowAuthModal(true)} />} />
            <Route
              path="/login"
              element={<LoginPage auth={auth} onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={<RegisterPage auth={auth} onRegister={handleRegister} />}
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

function HomePage({ onOpenLogin }) {
  return (
    <div className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">Freshness, on your schedule</span>
        <h1>Groceries that fit your day.</h1>
        <p>Pick up when it suits you or get essentials delivered to your door.</p>
        <div className="cta-row">
          <button type="button" className="primary-btn" onClick={onOpenLogin}>
            Browse groceries
          </button>
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
  )
}

function AuthModal({ onClose, onLogin, onSuccess }) {
  const [form, setForm] = useState({
    email: 'admin@minidmart.com',
    password: 'Admin@123',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="customer@minidmart.test"
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

        <p className="demo-note">
          Demo: admin@minidmart.com / Admin@123 | customer@minidmart.test / Customer123!
        </p>
      </div>
    </div>
  )
}

function LoginPage({ auth, onLogin }) {
  const [form, setForm] = useState({ email: 'admin@minidmart.com', password: 'Admin@123' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (auth) return <Navigate to="/products" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onLogin(form)
      navigate('/products')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="panel form-panel">
      <h2>Login</h2>
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
    </div>
  )
}

function RegisterPage({ auth, onRegister }) {
  const [form, setForm] = useState({ name: 'New Customer', email: '', password: '', role: 'customer' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (auth) return <Navigate to="/products" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onRegister(form)
      navigate('/products')
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

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="panel">
      <div className="section-header">
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

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article key={product._id} className="product-card">
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
          <Link className="primary-btn" to="/products">Continue shopping</Link>
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
  if (cart.length === 0) return <Navigate to="/products" replace />

  const submitCheckout = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await onCheckout(form)
      navigate('/products')
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
      navigate('/products')
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
      navigate('/products')
    } catch (err) {
      setError(err.message)
    }
  }

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered']
  const returnStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed']

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Operations</span>
          <h2>Staff & admin dashboard</h2>
        </div>
      </div>

      <div className="stats-box dashboard-stats">
        <div>
          <strong>{orders.length}</strong>
          <span>Total orders</span>
        </div>
        <div>
          <strong>{returnRequests.length}</strong>
          <span>Return requests</span>
        </div>
        <div>
          <strong>{products.length}</strong>
          <span>Products</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>Inventory management</h3>
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
                <h3>{product.name}</h3>
                <p>{product.category}</p>
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
          <h3>Order lifecycle</h3>
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
          <h3>Return & exchange queue</h3>
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
