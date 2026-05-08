const db = require('../config/database');

class UserRepository {
    /**
     * Find user by email
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
                if (err) reject(err);
                else resolve(user || null);
            });
        });
    }

    /**
     * Find user by ID
     * @param {number} userId
     * @returns {Promise<Object|null>}
     */
    findById(userId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
                if (err) reject(err);
                else resolve(user || null);
            });
        });
    }

    /**
     * Create new user
     * @param {Object} userData - {name, email, password}
     * @returns {Promise<number>} - insertId
     */
    create(userData) {
        return new Promise((resolve, reject) => {
            const { name, email, password } = userData;
            const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

            db.run(sql, [name, email, password], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    /**
     * Update user password
     * @param {number} userId
     * @param {string} hashedPassword
     * @returns {Promise<void>}
     */
    updatePassword(userId, hashedPassword) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Check if email already exists
     * @param {string} email
     * @returns {Promise<boolean>}
     */
    emailExists(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
                if (err) reject(err);
                else resolve(!!user);
            });
        });
    }
}

module.exports = new UserRepository();
