const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const orderRepository = require('../repositories/OrderRepository');
const productService = require('./ProductService');

class OrderService {
    /**
     * Validate credit card number
     * @param {string} creditCard
     * @returns {boolean}
     */
    validateCreditCard(creditCard) {
        if (!creditCard) return false;
        const sanitized = creditCard.replace(/[\s-]/g, '');
        return sanitized.length === 16 && /^[0-9]+$/.test(sanitized);
    }

    /**
     * Validate email matches token
     * @param {string} email
     * @param {Object} decodedToken
     * @returns {boolean}
     */
    validateEmailMatch(email, decodedToken) {
        return email === decodedToken.email;
    }

    /**
     * Process checkout order (Fixed: Secure Price calculation & Sanitized Logging)
     * @param {Object} user - {userId, email}
     * @param {Array} cart - Cart items
     * @param {string} creditCard
     * @returns {Promise<Object>}
     */
    async processCheckout(user, cart, creditCard) {
        // Validate inputs
        if (!Array.isArray(cart) || cart.length === 0) {
            throw new Error('Cart is empty');
        }

        if (!creditCard || !this.validateCreditCard(creditCard)) {
            throw new Error('Invalid credit card number');
        }

        // 🛡️ Security: Calculate total using DB prices, not client prices
        const totalAmount = await productService.calculateCartTotal(cart);

        // Create order in database
        const orderId = uuidv4();

        try {
            // Use database transaction
            await new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');

                    // 🛡️ Security: Create order items using DB-verified data
                    orderRepository.createOrder({
                        order_id: orderId,
                        user_id: user.userId,
                        user_email: user.email,
                        total_price: totalAmount,
                        status: 'Paid'
                    }).then(async () => {
                        // Re-fetch products to get authoritative names and prices for the record
                        const productIds = cart.map(item => item.id);
                        const dbProducts = await require('../repositories/ProductRepository').getByIds(productIds);
                        const productMap = {};
                        dbProducts.forEach(p => { productMap[p.id] = p; });

                        const items = cart.map(item => {
                            const dbP = productMap[item.id];
                            return {
                                product_id: item.id,
                                product_name: dbP.name,
                                quantity: Number(item.quantity || 0),
                                price: dbP.current_price
                            };
                        });

                        return orderRepository.createOrderItems(orderId, items);
                    }).then(() => {
                        db.run('COMMIT', (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                            } else {
                                console.log(`🚀 [OrderService] Transaction Committed: ${orderId}`);
                                resolve();
                            }
                        });
                    }).catch((err) => {
                        db.run('ROLLBACK');
                        reject(err);
                    });
                });
            });

            // Log final state (Sanitized)
            console.log(`📊 [OrderService] Order processed for user: ${user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`);

            return {
                success: true,
                orderId,
                totalAmount,
                message: 'Order placed successfully'
            };
        } catch (error) {
            // 🛡️ Security: Sanitize error logging (Remove sensitive data)
            console.error('❌ [OrderService] Checkout error:', error.message);
            throw new Error('Failed to process checkout. Please verify your payment details.');
        }
    }

    /**
     * Get user orders
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    async getUserOrders(userId) {
        try {
            const orders = await orderRepository.getByUserId(userId);
            return orders;
        } catch (error) {
            console.error('❌ [OrderService] Error retrieving user orders:', error.message);
            throw new Error('Failed to retrieve orders');
        }
    }

    /**
     * Get order details with items
     * @param {string} orderId
     * @returns {Promise<Object>}
     */
    async getOrderDetails(orderId) {
        try {
            const order = await orderRepository.getByOrderId(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            const items = await orderRepository.getOrderItems(orderId);

            return {
                ...order,
                items
            };
        } catch (error) {
            console.error('❌ [OrderService] Error retrieving order details:', error.message);
            throw new Error('Failed to retrieve order details');
        }
    }
}

module.exports = new OrderService();
