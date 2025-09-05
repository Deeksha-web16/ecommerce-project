const mongoose = require("mongoose");
const Product = require("./models/Product");

// Connect to your database
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Products with working image URLs
const products = [
  {
    title: "Nike Running Shoes",
    price: 2999,
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Comfortable and stylish running shoes designed for everyday workouts and casual wear. Breathable fabric with sturdy soles for long-lasting support.",
    stock: 50
  },
  {
    title: "Wireless Headphones",
    price: 1999,
    image: "https://plus.unsplash.com/premium_photo-1679513691474-73102089c117?q=80&w=1113&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Noise-cancelling wireless headphones with long battery life.",
    stock: 75,
  },
  {
    title: "Elegant Evening Dress",
    price: 4999,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "A stunning evening dress perfect for special occasions.",
    stock: 20
  },
  {
    title: "Gaming Laptop",
    price: 69999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80",
    description: "Powerful gaming laptop with dedicated GPU for smooth gameplay.",
    stock: 20,
  },
  {
    title: "Smartwatch Series 5",
    price: 9999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    description: "Stay connected and track your fitness with this smartwatch.",
    stock: 60,
  },
  {
    title: "Luxury Skincare Cream",
    price: 1999,
    image: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Premium skincare cream for all skin types. Provides deep hydration, smooths texture, and enhances natural glow. Enriched with vitamins and antioxidants for healthy skin.",
    stock: 80

  },
];

// Seed the database
async function seedDB() {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products inserted successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  }
}

seedDB();
