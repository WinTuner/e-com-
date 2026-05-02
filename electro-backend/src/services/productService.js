const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./electro.db');

// แปลง Callback ของ SQLite เป็น Promise เพื่อใช้กับ async/await
const getProductsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        // Fetch data from Database
        const sql = `SELECT * FROM products WHERE category = ?`;
        db.all(sql, [category], (err, rows) => {
            if (err) reject(err);
            resolve(rows); // Return Package
        });
    });
};

const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM products`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

module.exports = { getProductsByCategory, getAllProducts };