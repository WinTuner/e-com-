const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database'); 

const JWT_SECRET = 'electro_2026_secret';

// --- LOGIN ROUTE (Upgraded) ---
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log(`🔍 [Auth] Attempting login for: ${email}`);

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) {
            console.error("❌ [Error] Database error:", err.message);
            return res.status(500).json({ message: "Server error: Cannot read user data" });
        }

        if (!user) {
            console.log(`⚠️ [Auth] User not found: ${email}`);
            return res.status(401).json({ message: "ไม่พบชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }

        try {
            let isMatch = false;
            let isLegacyMD5 = false;

            // 1. เช็คด้วย Bcrypt (สำหรับ User ใหม่หรือ User ที่อัปเกรดแล้ว)
            if (user.password.startsWith('$2b$')) { 
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                // 2. เช็คด้วย MD5 (สำหรับ User เก่า 11 คนจากระบบเก่า)
                const inputMd5 = crypto.createHash('md5').update(password).digest('hex');
                if (inputMd5 === user.password) {
                    isMatch = true;
                    isLegacyMD5 = true; 
                }
            }

            if (isMatch) {
                // 🌟 [Security Upgrade] ถ้า Login สำเร็จด้วย MD5 ให้เปลี่ยนเป็น Bcrypt ทันที
                if (isLegacyMD5) {
                    const newHashedPassword = await bcrypt.hash(password, 10);
                    db.run(`UPDATE users SET password = ? WHERE id = ?`, [newHashedPassword, user.id]);
                    console.log(`🛡️ [Security] Upgraded password to Bcrypt for: ${user.email}`);
                }

                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: '2h' }
                );

                res.status(200).json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        userId: user.id,
                        firstName: user.name,
                        email: user.email
                    }
                });
            } else {
                console.log(`⚠️ [Auth] Wrong password for: ${email}`);
                res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
            }
        } catch (error) {
            console.error("❌ [Auth] Error during comparison:", error);
            res.status(500).json({ message: "เกิดข้อผิดพลาดภายในระบบ" });
        }
    });
});

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // ใช้ Bcrypt สำหรับการสมัครใหม่เสมอ
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

        db.run(sql, [name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    console.log(`⚠️ [Register] Email already exists: ${email}`);
                    return res.status(409).json({ message: "Email/Username already exists" });
                }
                return res.status(500).json({ message: "Failed to save user data" });
            }

            console.log(`✅ [Register] New user created: ${email}`);
            res.status(201).json({ success: true, message: "Registration successful" });
        });

    } catch (hashErr) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;