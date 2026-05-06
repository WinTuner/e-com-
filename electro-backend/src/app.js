const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);              // /api/login, /api/register
app.use('/api/products', productRoutes);  // /api/products
app.use('/api', checkoutRoutes);          // /api/checkout

module.exports = app;
