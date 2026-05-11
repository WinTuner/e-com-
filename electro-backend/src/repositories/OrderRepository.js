const db = require('../config/database');

class OrderRepository {
    /**
     * Create new order
     * @param {Object} orderData - {order_id, user_id, user_email, total_price, status}
     * @returns {Promise<void>}
     */
    createOrder(orderData) {
        return new Promise((resolve, reject) => {
            const { order_id, user_id, user_email, total_price, status } = orderData;
            const insertOrderQuery = `
                INSERT INTO orders (order_id, user_id, user_email, total_price, status)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.run(insertOrderQuery, [order_id, user_id, user_email, total_price, status], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Create order items (Fixed: Correctly awaits all insertions)
     * @param {string} orderId
     * @param {Array} items - Array of {product_id, product_name, quantity, price}
     * @returns {Promise<void>}
     */
    createOrderItems(orderId, items) {
        return new Promise((resolve, reject) => {
            const insertItemQuery = `
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, ?)
            `;
            const stmt = db.prepare(insertItemQuery);
            
            // Create an array of promises for each item insertion
            const insertionPromises = items.map(item => {
                return new Promise((res, rej) => {
                    stmt.run(
                        [orderId, item.product_id, item.product_name, item.quantity, item.price],
                        (err) => {
                            if (err) rej(err);
                            else res();
                        }
                    );
                });
            });

            // Wait for ALL insertions to complete before finalizing
            Promise.all(insertionPromises)
                .then(() => {
                    stmt.finalize((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                })
                .catch((err) => {
                    console.error('[OrderRepository] Batch insertion error:', err.message);
                    stmt.finalize(); // Clean up statement
                    reject(new Error('Failed to save all order items'));
                });
        });
    }

    /**
     * Get order by order ID
     * @param {string} orderId
     * @returns {Promise<Object|null>}
     */
    getByOrderId(orderId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, order) => {
                if (err) reject(err);
                else resolve(order || null);
            });
        });
    }

    /**
     * Get order items by order ID
     * @param {string} orderId
     * @returns {Promise<Array>}
     */
    getOrderItems(orderId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [orderId],
                (err, items) => {
                    if (err) reject(err);
                    else resolve(items || []);
                }
            );
        });
    }

    /**
     * Get all orders for a user
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    getByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
                [userId],
                (err, orders) => {
                    if (err) reject(err);
                    else resolve(orders || []);
                }
            );
        });
    }

    /**
     * Update order status
     * @param {string} orderId
     * @param {string} status
     * @returns {Promise<void>}
     */
    updateOrderStatus(orderId, status) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE orders SET status = ? WHERE order_id = ?`,
                [status, orderId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Count total orders in database
     * @returns {Promise<number>}
     */
    countTotal() {
        return new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM orders`, (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.count : 0);
            });
        });
    }
}

module.exports = new OrderRepository();
