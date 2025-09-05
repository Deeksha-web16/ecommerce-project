const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Admin login page
router.get('/login', (req, res) => res.render('admin/login'));

// Admin login POST
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.send('Invalid admin credentials');
});

// Admin dashboard
router.get('/', async (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  const products = await Product.find().sort({ createdAt: -1 });
  res.render('admin/dashboard', { products });
});

// Add product form
router.get('/add-product', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  res.render('admin/addproduct');
});

// Add product POST
router.post('/add-product', async (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  const { title, description, price, image, stock } = req.body;
  const p = new Product({ title, description, price: Number(price), image, stock: Number(stock || 100) });
  await p.save();
  res.redirect('/admin');
});

// View orders
router.get('/orders', async (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  const orders = await Order.find().populate('user').populate('items.product');
  res.render('admin/vieworders', { orders });
});

// View customers
router.get('/customers', async (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  const customers = await User.find().sort({ createdAt: -1 });
  res.render('admin/viewcustomers', { customers });
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

module.exports = router;