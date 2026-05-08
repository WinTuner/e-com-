const productRepository = require('../repositories/ProductRepository');

class ProductService {
    /**
     * Get all active products
     * @returns {Promise<Array>}
     */
    async getAllProducts() {
        try {
            const products = await productRepository.getAll();
            console.log(`✅ [ProductService] Retrieved ${products.length} products`);
            return products;
        } catch (error) {
            console.error('❌ [ProductService] Error retrieving products:', error.message);
            throw new Error('Failed to retrieve products');
        }
    }

    /**
     * Get products by category
     * @param {string} category
     * @returns {Promise<Array>}
     */
    async getProductsByCategory(category) {
        try {
            if (!category || category === 'All Category') {
                return await this.getAllProducts();
            }

            const products = await productRepository.getByCategory(category);
            console.log(`✅ [ProductService] Retrieved ${products.length} products for category: ${category}`);
            return products;
        } catch (error) {
            console.error('❌ [ProductService] Error retrieving products by category:', error.message);
            throw new Error('Failed to retrieve products by category');
        }
    }

    /**
     * Get product details by ID
     * @param {number} productId
     * @returns {Promise<Object>}
     */
    async getProductById(productId) {
        try {
            const product = await productRepository.getById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            console.error('❌ [ProductService] Error retrieving product:', error.message);
            throw new Error('Failed to retrieve product');
        }
    }

    /**
     * Validate if products exist before checkout
     * @param {Array<Object>} cartItems - Array of {id, name, price, quantity}
     * @returns {Promise<boolean>}
     */
    async validateCartItems(cartItems) {
        try {
            const productIds = cartItems.map(item => item.id);
            const validProducts = await productRepository.getByIds(productIds);

            if (validProducts.length !== productIds.length) {
                throw new Error('Some products in cart are no longer available');
            }

            return true;
        } catch (error) {
            console.error('❌ [ProductService] Cart validation error:', error.message);
            throw error;
        }
    }

    /**
     * Calculate total price with validation
     * @param {Array<Object>} cartItems
     * @returns {Promise<number>}
     */
    async calculateCartTotal(cartItems) {
        try {
            // Validate items exist
            await this.validateCartItems(cartItems);

            const total = cartItems.reduce((sum, item) => {
                const price = Number(item.price || item.current_price || 0);
                const quantity = Number(item.quantity || 0);
                if (price < 0 || quantity < 0) {
                    throw new Error('Invalid price or quantity');
                }
                return sum + (price * quantity);
            }, 0);

            return total;
        } catch (error) {
            console.error('❌ [ProductService] Error calculating total:', error.message);
            throw new Error('Failed to calculate cart total');
        }
    }
}

module.exports = new ProductService();
