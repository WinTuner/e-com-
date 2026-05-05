const express = require('express');
const cors = require('cors'); // นำเข้า Library
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes'); // 🌟 1. นำเข้า checkoutRoutes

const app = express();

// --- Middleware ---
// อนุญาตให้ Frontend (เช่น Live Server) เข้าถึงได้
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Routes ---
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', checkoutRoutes); // 🌟 2. เสียบปลั๊ก Checkout เข้าสู่ระบบ API หลัก

module.exports = app;