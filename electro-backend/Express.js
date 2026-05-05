// src/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // สำหรับสร้าง Order ID

// ต้องใช้ Secret Key เดียวกับตอนสร้าง Token ในระบบ Login
const JWT_SECRET = 'electro_2026_secret'; 

// สมมติว่ามีตัวแปร db (SQLite) ถูกส่งเข้ามาแล้ว
// const db = new sqlite3.Database('./electro.db');

router.post('/checkout', (req, res) => {
    // --- 1. ตรวจสอบ Login (Authentication Check) ---
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

    // --- ดึงข้อมูลจาก Request Body ---
    const { cart, email, creditCard } = req.body;

    // --- 2. Is the cart empty? ---
    if (!cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: "Checkout rejected: Your cart is empty." });
    }

    // --- 3. Is the email valid & matches logged-in user? ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Checkout rejected: Invalid email format." });
    }
    if (email !== decodedUser.id) { // ป้องกันไม่ให้แอบอ้างใช้อีเมลคนอื่นสั่งซื้อ
        return res.status(403).json({ success: false, message: "Forbidden: Email does not match logged-in user." });
    }

    // --- 4. Is the credit card number the right length? ---
    const sanitizedCard = creditCard ? creditCard.replace(/[\s-]/g, '') : '';
    if (!sanitizedCard || sanitizedCard.length !== 16 || isNaN(sanitizedCard)) {
        return res.status(400).json({ success: false, message: "Checkout rejected: Credit card number must be exactly 16 digits." });
    }

    // --- 5. All "Yes" -> Create Order & Save to DB ---
    const orderId = uuidv4();
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // บันทึกลง SQLite
    const insertOrderQuery = `INSERT INTO orders (order_id, user_email, total_amount, status, created_at) VALUES (?, ?, ?, ?, datetime('now'))`;
    
    db.run(insertOrderQuery, [orderId, email, totalAmount, 'Paid'], function(err) {
        if (err) {
            console.error('❌ Database insertion error:', err.message);
            return res.status(500).json({ success: false, message: "Internal Server Error: Failed to save order." });
        }

        // คืนค่า 201 Success
        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderId: orderId
        });
    });
});

module.exports = router;