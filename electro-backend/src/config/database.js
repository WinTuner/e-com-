const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// เชื่อมต่อฐานข้อมูลที่อยู่ที่โฟลเดอร์นอกของ src (ระดับเดียวกับ server.js)
const dbPath = path.join(__dirname, '../../electro.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.message);
    } else {
        console.log('✅ Connected to the SQLite database at:', dbPath);
    }
});

// Initialize basic tables
// ในไฟล์ src/config/database.js ส่วน db.serialize

db.serialize(() => {
    console.log("🔄 Resetting tables to sync schema...");

    // 🌟 เพิ่ม 2 บรรทัดนี้เพื่อลบของเก่าที่มีปัญหาออก
    db.run(`DROP TABLE IF EXISTS order_items`);
    db.run(`DROP TABLE IF EXISTS orders`);

    // จากนั้นปล่อยให้โค้ดเดิมของคุณทำงาน (มันจะสร้างตารางใหม่ที่มี order_id ให้เอง)
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE,        -- คอลัมน์ที่ Error แจ้งว่าหาไม่เจอ
        user_id INTEGER,
        user_email TEXT,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        product_id INTEGER,
        product_name TEXT,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);
    
    console.log("✅ Tables recreated with correct columns!");
});


module.exports = db;