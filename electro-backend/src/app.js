const express = require('express');
const cors = require('cors'); // นำเข้า Library
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// --- Middleware ---

// แก้ไขจุดนี้: อนุญาตให้ Frontend (เช่น Live Server) เข้าถึงได้
app.use(cors({
    origin: '*', // ในการพัฒนาใช้ * ได้ แต่ถ้าทำจริงควรระบุเป็น http://127.0.0.1:5500
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Routes ---
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);

module.exports = app;