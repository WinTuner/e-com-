const db = require('../config/database'); // ไฟล์เชื่อมต่อ SQLite ของคุณ

// ดึงสินค้าทั้งหมด (ที่ยังเปิดขายอยู่)
const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM products WHERE is_active = 1`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// ดึงสินค้าตามหมวดหมู่ (ที่ยังเปิดขายอยู่)
const getProductsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM products WHERE category = ? AND is_active = 1`;
        db.all(sql, [category], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    getAllProducts,
    getProductsByCategory
};