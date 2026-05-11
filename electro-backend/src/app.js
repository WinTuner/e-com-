const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();

// 🛡️ Security: Set security HTTP headers
app.use(helmet());

// 🚀 Performance: Compress response bodies
app.use(compression());

// 🛡️ Security: Limit requests from same IP (Global)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);              // /api/login, /api/register
app.use('/api/products', productRoutes);  // /api/products
app.use('/api', checkoutRoutes);          // /api/checkout

// 🛠️ Error Handling: Catch-all error handler (must be last)
app.use(errorHandler);

module.exports = app;
