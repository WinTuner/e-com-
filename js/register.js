// js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const msgElement = document.getElementById('message'); // เอาไว้โชว์ Error สีแดง

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // ป้องกันหน้าเว็บ Refresh

            // 1. รับค่าจากฟอร์ม
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 2. Frontend Validation Logic
            // เช็คความยาวอย่างน้อย 8 ตัว
            if (password.length < 8) {
                return showError("Password must be at least 8 characters long.");
            }
            // เช็คตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
            if (!/[A-Z]/.test(password)) {
                return showError("Password must contain at least one uppercase letter.");
            }
            // เช็คตัวอักษรพิเศษอย่างน้อย 1 ตัว
            if (!/[!@#$%^&*]/.test(password)) {
                return showError("Password must contain at least one special character (!, @, #, $, %, ^, &, *).");
            }

            try {
                // 3. ส่งข้อมูลไปที่ Backend (API)
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const result = await response.json();

                // 4. จัดการ Response
                if (response.status === 201) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html'; // ส่งกลับไปหน้า Login
                } else {
                    showError(result.message); // แสดง Error จาก Backend (เช่น User ซ้ำ)
                }
            } catch (error) {
                console.error("Connection Error:", error);
                showError("Cannot connect to the server.");
            }
        });
    }

    // Helper function สำหรับแสดงข้อความ Error
    function showError(text) {
        msgElement.innerText = text;
        msgElement.classList.add('text-danger');
    }
});