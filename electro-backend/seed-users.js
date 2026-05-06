const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. เชื่อมต่อ Database (ใช้ Path เดียวกับที่เซิร์ฟเวอร์ใช้)
const dbPath = path.join(__dirname, 'electro.db');
const db = new sqlite3.Database(dbPath);

// 2. ข้อมูล JSON Users จากที่คุณให้มา
const usersData = [
    { "username": "natto.dev@example.com", "password_hash": "e10adc3949ba59abbe56e057f20f883e", "first_name": "Natto", "reg_date": "2026-04-10" },
    { "username": "somchai.s@cmu.ac.th", "password_hash": "5f4dcc3b5aa765d61d8327deb882cf99", "first_name": "Somchai", "reg_date": "2026-04-15" },
    { "username": "jane.doe@electro.io", "password_hash": "7c4a8d09ca3762af61e59520943dc264", "first_name": "Jane", "reg_date": "2026-04-20" },
    { "username": "it_support@cachyos.org", "password_hash": "1a1dc91c907325c69271ddf0c944bc72", "first_name": "Somsak", "reg_date": "2026-04-22" },
    { "username": "devops_guy@linux.com", "password_hash": "827ccb0eea8a706c4c34a16891f84e7b", "first_name": "Vichai", "reg_date": "2026-04-25" },
    { "username": "tester01@gmail.com", "password_hash": "202cb962ac59075b964b07152d234b70", "first_name": "Ananya", "reg_date": "2026-04-28" },
    { "username": "fullstack.dev@camt.cmu", "password_hash": "469e9652e32c77ad9195e4d161658a5e", "first_name": "Peerawat", "reg_date": "2026-05-01" },
    { "username": "customer.care@shoppy.th", "password_hash": "96e79218965eb72c92a549dd5a330112", "first_name": "Kanya", "reg_date": "2026-05-02" },
    { "username": "admin_electro@internal.com", "password_hash": "21232f297a57a5a743894a0e4a801fc3", "first_name": "Admin", "reg_date": "2026-05-03" },
    { "username": "guest_user@web.com", "password_hash": "084e0343a0486ff05530df6c705c8bb9", "first_name": "Guest", "reg_date": "2026-05-04" },
    { "username": "dev.dii@cmu.ac.th", "password_hash": "20e5250189446de4f8219545c1af965d", "first_name": "Dev CAMT", "reg_date": "2026-05-05" }
];

db.serialize(() => {
    console.log("⏳ Re-initializing Users table...");

    // 🌟 เพิ่มบรรทัดนี้เพื่อลบตารางเก่าทิ้งก่อน (เฉพาะช่วง Dev นะครับ)
    db.run(`DROP TABLE IF EXISTS users`);

    // สร้างตารางใหม่ที่มีคอลัมน์ name, email, password ตามที่ Seeder ต้องการ
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,           -- คอลัมน์ที่ Error แจ้งว่าหาไม่เจอ
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME
    )`);

    // เตรียมคำสั่ง Insert (ใช้คอลัมน์ที่ตรงกับตารางด้านบน)
    const stmt = db.prepare(`INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)`);

    let count = 0;
    usersData.forEach((u) => {
        // u.first_name -> name
        // u.username -> email
        // u.password_hash -> password
        stmt.run([u.first_name, u.username, u.password_hash, u.reg_date], (err) => {
            if (err) {
                console.error(`❌ Error inserting ${u.username}:`, err.message);
            } else {
                count++;
            }
        });
    });

    stmt.finalize(() => {
        console.log(`✅ [Success] Migrated ${count} users to SQLite database!`);
        db.close();
    });
});