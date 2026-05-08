const db = require('../config/database');

class ProductRepository {
    /**
     * Get all active products
     * @returns {Promise<Array>}
     */
    getAll() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM products WHERE is_active = 1`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Get products by category
     * @param {string} category
     * @returns {Promise<Array>}
     */
    getByCategory(category) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM products WHERE category = ? AND is_active = 1`;
            db.all(sql, [category], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Get product by ID
     * @param {number} productId
     * @returns {Promise<Object|null>}
     */
    getById(productId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM products WHERE id = ? AND is_active = 1`;
            db.get(sql, [productId], (err, product) => {
                if (err) reject(err);
                else resolve(product || null);
            });
        });
    }

    /**
     * Get multiple products by IDs
     * @param {Array<number>} productIds
     * @returns {Promise<Array>}
     */
    getByIds(productIds) {
        return new Promise((resolve, reject) => {
            if (!productIds || productIds.length === 0) {
                resolve([]);
                return;
            }
            const placeholders = productIds.map(() => '?').join(',');
            const sql = `SELECT * FROM products WHERE id IN (${placeholders}) AND is_active = 1`;
            db.all(sql, productIds, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Check if product exists and is active
     * @param {number} productId
     * @returns {Promise<boolean>}
     */
    exists(productId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id FROM products WHERE id = ? AND is_active = 1`,
                [productId],
                (err, product) => {
                    if (err) reject(err);
                    else resolve(!!product);
                }
            );
        });
    }
}

module.exports = new ProductRepository();
