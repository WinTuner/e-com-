const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const JWT_SECRET = 'electro_2026_secret';

// เชื่อมต่อฐานข้อมูล SQLite (ไฟล์ electro.db จะอยู่ที่ root ของโปรเจกต์)
const dbPath = path.join(__dirname, '../../../electro.db'); // ปรับ Path ให้ตรงกับโฟลเดอร์ของคุณ
const db = new sqlite3.Database(dbPath);

// สร้างตาราง orders อัตโนมัติถ้ายังไม่มี
db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE,
    user_email TEXT,
    total_amount REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

router.post('/checkout', (req, res) => {
    // 1. ตรวจสอบ Login (Authentication Check)
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Unauthorized: Please login first." });
    }

    const token = authHeader.split(' ')[1];
    let decodedUser;

    try {
        decodedUser = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token." });
    }

    // 2. ดึงข้อมูลจาก Request Body
    const { cart, email, creditCard } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: "Checkout rejected: Your cart is empty." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Checkout rejected: Invalid email format." });
    }
    
    // ป้องกันการแอบอ้างใส่อีเมลคนอื่น
    if (email !== decodedUser.id) { 
        return res.status(403).json({ success: false, message: "Forbidden: Email does not match logged-in user." });
    }

    const sanitizedCard = creditCard ? creditCard.replace(/[\s-]/g, '') : '';
    if (!sanitizedCard || sanitizedCard.length !== 16 || isNaN(sanitizedCard)) {
        return res.status(400).json({ success: false, message: "Checkout rejected: Credit card number must be exactly 16 digits." });
    }

    // 3. สร้าง Order ID และคำนวณยอดรวม
    const orderId = uuidv4();
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 4. บันทึกลง SQLite
    const insertOrderQuery = `INSERT INTO orders (order_id, user_email, total_amount, status) VALUES (?, ?, ?, ?)`;
    
    db.run(insertOrderQuery, [orderId, email, totalAmount, 'Paid'], function(err) {
        if (err) {
            console.error('❌ [Checkout] Database error:', err.message);
            return res.status(500).json({ success: false, message: "Internal Server Error: Failed to save order." });
        }

        console.log(`✅ [Checkout] Order ${orderId} created for ${email}`);
        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderId: orderId
        });
    });
});

module.exports = router;