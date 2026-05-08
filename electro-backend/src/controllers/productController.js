const productController = require('./CheckoutController');

module.exports = {
    getProducts: (req, res) => productController.getProducts(req, res),
    getProductById: (req, res) => productController.getProductById(req, res)
};