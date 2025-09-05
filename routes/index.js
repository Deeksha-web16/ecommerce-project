const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ensureLoggedIn } = require('../utils/authMiddleware');

// Utility to calculate cart count
function getCartCount(cart) {
  if (!cart) return 0;
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// Home - show products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(20);
    res.render('index', {
      products,
      user: req.session.user,
      cartCount: getCartCount(req.session.cart)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading products');
  }
});

// Register - GET
router.get('/register', (req, res) =>
  res.render('register', {
    user: req.session.user,
    cartCount: getCartCount(req.session.cart)
  })
);

// Register - POST
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.send('User already exists. <a href="/login">Login</a>');
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash });
  await user.save();
  req.session.user = { id: user._id, name: user.name, email: user.email };
  res.redirect('/');
});

// Login - GET
router.get('/login', (req, res) =>
  res.render('login', {
    user: req.session.user,
    cartCount: getCartCount(req.session.cart)
  })
);

// Login - POST
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.send('Invalid credentials');
  req.session.user = { id: user._id, name: user.name, email: user.email };
  res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Product detail
router.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('product', {
    product,
    user: req.session.user,
    cartCount: getCartCount(req.session.cart)
  });
});
// Add product to cart
router.post('/cart/add/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/');
  const qty = parseInt(req.body.qty) || 1;

  req.session.cart = req.session.cart || [];

  const existing = req.session.cart.find(i => i.id === product._id.toString());
  if (existing) {
    existing.qty += qty;
  } else {
    req.session.cart.push({
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      qty
    });
  }

  res.redirect('/cart');
});

// Remove product from cart
router.post('/cart/remove/:id', (req, res) => {
  const productId = req.params.id;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.id !== productId);
  }
  res.redirect('/cart');
});

// Update product quantity in cart
router.post('/cart/update/:id', (req, res) => {
  const productId = req.params.id;
  const newQty = parseInt(req.body.qty) || 1;

  if (req.session.cart) {
    const item = req.session.cart.find(i => i.id === productId);
    if (item) item.qty = newQty;
  }

  res.redirect('/cart');
});

// View cart
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0);

  res.render('cart', {
    cart,
    total,
    user: req.session.user,
    cartCount: cart.reduce((sum, it) => sum + it.qty, 0)
  });
});

// Checkout (create order) - requires login
router.post('/checkout', ensureLoggedIn, async (req, res) => {
  const { address, paymentMethod } = req.body;
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');

  const items = cart.map((it) => ({
    product: it.id,
    qty: it.qty,
    price: it.price
  }));
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  const order = new Order({
    user: req.session.user.id,
    items,
    total,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid'
  });
  await order.save();

  // Add notification to user
  const user = await User.findById(req.session.user.id);
  user.notifications.push(
    `Order placed successfully. Order ID: ${order._id}`
  );
  await user.save();

  // Clear cart & add server-side notification
  req.session.cart = [];
  req.session.notifications = req.session.notifications || [];
  req.session.notifications.push('Order placed successfully.');

  res.redirect('/orders');
});

// View my orders
router.get('/orders', ensureLoggedIn, async (req, res) => {
  const orders = await Order.find({ user: req.session.user.id }).populate(
    'items.product'
  );
  const notifs = req.session.notifications || [];
  req.session.notifications = [];
  res.render('orders', {
    orders,
    notifs,
    user: req.session.user,
    cartCount: getCartCount(req.session.cart)
  });
});

module.exports = router;
