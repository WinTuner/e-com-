const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * GET /api/products
 * Get all products or filter by category
 * Query params: category (optional)
 */
router.get('/', (req, res) => productController.getProducts(req, res));

/**
 * GET /api/products/:id
 * Get product details by ID
 */
router.get('/:id', (req, res) => productController.getProductById(req, res));

module.exports = router;