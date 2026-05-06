const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const JWT_SECRET = 'electro_2026_secret';

router.post('/checkout', (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Please login first.',
                clearCart: false
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedUser = jwt.verify(token, JWT_SECRET);

        const { cart, email, creditCard } = req.body;

        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Checkout rejected: Your cart is empty.',
                clearCart: false
            });
        }

        if (!email || email !== decodedUser.email) {
            console.warn(`⚠️ [Auth Match Failed] Input: ${email} vs Token: ${decodedUser.email}`);
            return res.status(403).json({
                success: false,
                message: 'Forbidden: อีเมลไม่ตรงกับบัญชีที่เข้าสู่ระบบ',
                clearCart: false
            });
        }

        const sanitizedCard = creditCard ? creditCard.replace(/[\s-]/g, '') : '';
        if (!sanitizedCard || sanitizedCard.length !== 16 || !/^[0-9]+$/.test(sanitizedCard)) {
            return res.status(400).json({
                success: false,
                message: 'Checkout rejected: Credit card number must be exactly 16 digits.',
                clearCart: false
            });
        }

        const orderId = uuidv4();
        const userId = decodedUser.userId;
        const totalAmount = cart.reduce((sum, item) => {
            const price = Number(item.price || item.current_price || 0);
            const quantity = Number(item.quantity || 0);
            return sum + (price * quantity);
        }, 0);

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const insertOrderQuery = `
                INSERT INTO orders (order_id, user_id, user_email, total_price, status)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.run(insertOrderQuery, [orderId, userId, email, totalAmount, 'Paid'], function (err) {
                if (err) {
                    console.error('[Checkout] Database error saving order:', err.message);
                    db.run('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: `Checkout rejected: Unable to save order into database. (${err.message})`,
                        clearCart: false
                    });
                }

                const insertItemQuery = `
                    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                    VALUES (?, ?, ?, ?, ?)
                `;
                const stmt = db.prepare(insertItemQuery);
                let hasItemError = false;

                cart.forEach((item) => {
                    const price = Number(item.price || item.current_price || 0);
                    const quantity = Number(item.quantity || 0);
                    stmt.run([orderId, item.id, item.name, quantity, price], (itemErr) => {
                        if (itemErr) {
                            console.error(`[Checkout] Error saving item ${item.name}:`, itemErr.message);
                            hasItemError = true;
                        }
                    });
                });

                // --- ส่วนท้ายของ checkoutRoutes.js ตรง stmt.finalize ---

stmt.finalize((err) => {
    if (hasItemError || err) {
        console.error('❌ [Checkout] Rolling back due to errors.');
        db.run("ROLLBACK"); 
        return res.status(400).json({ success: false, message: 'Unable to save order items.' });
    } else {
        // 🌟 เพิ่ม Log ตรงนี้เพื่อยืนยันการบันทึกระดับ Low-level
        db.run("COMMIT", (commitErr) => {
            if (commitErr) {
                console.error('❌ [Checkout] Commit Failed:', commitErr.message);
                return res.status(500).json({ success: false, message: 'Database commit error' });
            }
            
            console.log(`🚀 [Database] Transaction Committed: ${orderId}`);
            
            // ลองนับจำนวน Order ทันทีหลัง Commit เพื่อพิสูจน์
            db.get("SELECT COUNT(*) as count FROM orders", (countErr, row) => {
                console.log(`📊 Current total orders in DB: ${row ? row.count : 0}`);
            });

            return res.status(201).json({
                success: true,
                message: 'Order placed successfully!',
                orderId,
                clearCart: true
            });
        });
    }
});
            });
        });
    } catch (error) {
        console.error('❌ [Checkout] Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error: An unexpected error occurred during checkout.',
            clearCart: false
        });
    }
}
);

module.exports = router;