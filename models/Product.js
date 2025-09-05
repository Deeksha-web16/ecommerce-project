const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  stock: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Product', productSchema);