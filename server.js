require('dotenv').config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  dbName: "ecommerce_db",
  collectionName: "sessions"
})
  })
);

// Make session user accessible in views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cartCount = req.session.cart ? req.session.cart.reduce((sum, it) => sum + it.qty, 0) : 0;
  res.locals.notifications = req.session.notifications || [];
  next();
});

// Routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));