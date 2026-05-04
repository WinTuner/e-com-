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