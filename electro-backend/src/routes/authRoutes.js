const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = 'electro_2026_secret';
// ถอย 1 (ออกจาก routes) -> ถอย 2 (ออกจาก src) -> ถอย 3 (ออกจาก electro-backend) -> เข้า data
const usersFilePath = path.join(__dirname, '../../../data/auth_user.json');

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // พิมพ์เช็คว่ากำลังอ่านไฟล์จาก Path ไหน
    console.log(`🔍 [Auth] Reading file from: ${usersFilePath}`);

    // 1. อ่านไฟล์ auth_user.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("❌ [Error] Cannot read auth_user.json:", err.message);
            return res.status(500).json({ message: "Server error: Cannot read user data" });
        }

        try {
            // 2. แปลงข้อความจากไฟล์เป็น Array ของ Object
            const users = JSON.parse(data);

            // 3. ค้นหา User ที่ตรงกับ email
            const user = users.find(u => u.username === email);

            if (!user) {
                console.log(`⚠️ [Auth] User not found: ${email}`);
                return res.status(401).json({ message: "ไม่พบชื่อผู้ใช้นี้" });
            }

            // 4. แปลง Password ที่ส่งมาเป็น MD5 เพื่อไปเทียบกับในไฟล์
            const inputHash = crypto.createHash('md5').update(password).digest('hex');

            if (inputHash === user.password_hash) {
                // 5. สร้าง Token (Passport)
                const token = jwt.sign(
                    { id: user.username, name: user.first_name },
                    JWT_SECRET,
                    { expiresIn: '2h' }
                );

                console.log(`✅ [Auth] Login Success: ${user.first_name}`);
                
                // 6. ส่ง Response กลับไปให้หน้า login.html
                res.status(200).json({
                    success: true,
                    token: token,
                    user: { firstName: user.first_name }
                });
            } else {
                console.log(`⚠️ [Auth] Wrong password for: ${email}`);
                res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
            }

        } catch (parseErr) {
            console.error("❌ [Error] JSON Parse Error:", parseErr.message);
            res.status(500).json({ message: "Data format error" });
        }
    });
});

module.exports = router;

// --- REGISTER ROUTE ---
router.post('/register', (req, res) => {
    // 1. รับข้อมูลจาก Frontend
    const { name, email, password } = req.body;

    // Gatekeeper: ตรวจสอบข้อมูลว่าง
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // 2. อ่านไฟล์ auth_user.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("❌ Read File Error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        try {
            const users = JSON.parse(data);

            // 3. เช็คว่ามี Username (email) นี้อยู่ในระบบแล้วหรือยัง?
            const userExists = users.some(u => u.username === email);
            if (userExists) {
                return res.status(409).json({ message: "Email/Username already exists" });
            }

            // 4. เข้ารหัส Password เป็น MD5 (ให้ตรงกับระบบเก่า)
            const passwordHash = crypto.createHash('md5').update(password).digest('hex');

            // หาวันที่ปัจจุบัน (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];

            // 5. สร้าง Object User คนใหม่
            const newUser = {
                username: email,
                password_hash: passwordHash,
                first_name: name,
                reg_date: today
            };

            // เพิ่มลงใน Array
            users.push(newUser);

            // 6. เขียนข้อมูลกลับลงไปในไฟล์ JSON
            // ใช้ JSON.stringify(users, null, 2) เพื่อจัด Format ให้สวยงามอ่านง่าย
            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("❌ Write File Error:", writeErr);
                    return res.status(500).json({ message: "Failed to save user data" });
                }

                console.log(`✅ [Register] New user created: ${email}`);
                // ส่ง Status 201 (Created) กลับไปที่ Frontend
                res.status(201).json({ success: true, message: "Registration successful" });
            });

        } catch (parseErr) {
            console.error("❌ JSON Parse Error:", parseErr);
            res.status(500).json({ message: "Data format error" });
        }
    });
});