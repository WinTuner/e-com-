const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products
// รองรับ Query String: /api/products?category=SmartPhone
router.get('/', productController.getProducts);

module.exports = router;