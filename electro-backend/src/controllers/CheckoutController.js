const productService = require('../services/ProductService');

class ProductController {
    /**
     * GET /api/products
     * Get all products or filter by category
     * Query params: category
     */
    async getProducts(req, res) {
        try {
            const { category } = req.query;

            let products;
            if (category && category !== 'All Category') {
                products = await productService.getProductsByCategory(category);
            } else {
                products = await productService.getAllProducts();
            }

            return res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('❌ [ProductController] Error retrieving products:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve products'
            });
        }
    }

    /**
     * GET /api/products/:id
     * Get product details by ID
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params;

            const product = await productService.getProductById(Number(id));

            return res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('❌ [ProductController] Error retrieving product:', error.message);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve product'
            });
        }
    }
}

module.exports = new ProductController();
