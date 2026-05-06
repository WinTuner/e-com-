// js/checkout.js

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. ดึง Token และ ข้อมูล User
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('user_name');

    // ถ้าไม่มี Token ให้เด้งไปหน้า Login ทันที
    if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
        window.location.href = 'login.html';
        return;
    }

    // 2. ดึงข้อมูลตะกร้าของ User คนนั้น (แยกตะกร้าตาม User)
    const cartKey = `shopping_cart_${userName}`;
    const savedCart = localStorage.getItem(cartKey);
    const cartData = savedCart ? JSON.parse(savedCart) : [];

    // ดึงค่าจากฟอร์มหน้าเว็บ
    const email = document.getElementById('checkoutEmail').value;
    const creditCard = document.getElementById('checkoutCard').value;

    try {
        // 3. ยิง Request ไปที่ Backend พร้อมแนบ Token ใน Header
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- สำคัญมาก: ส่ง Token ไปให้ Backend ตรวจ
            },
            body: JSON.stringify({
                cart: cartData,
                email: email,
                creditCard: creditCard
            })
        });

        const result = await response.json();

        // 4. จัดการผลลัพธ์
        if (response.status === 201) {
            alert(`สั่งซื้อสำเร็จ! รหัสอ้างอิง: ${result.orderId}`);
            
            // ล้างตะกร้าก็ต่อเมื่อ Backend อนุญาต
            if (result.clearCart === true) {
                localStorage.removeItem(cartKey);
            }
            
            // เปลี่ยนหน้าไปหน้าขอบคุณ หรือกลับหน้าแรก
            window.location.href = 'index.html'; 
        } else {
            // แสดง Error ตามเงื่อนไขที่พัง (เช่น บัตรผิด, ตะกร้าว่าง, Token หมดอายุ)
            alert(`ไม่สามารถสั่งซื้อได้: ${result.message}`);

            // เมื่อ Backend ระบุ clearCart: false ให้เก็บตะกร้าไว้เพื่อกดสั่งใหม่
            if (result.clearCart === false) {
                console.log('Checkout failed; keep cart for retry.');
            }
            
            // ถ้า Token มีปัญหา ให้ไล่กลับไปล็อกอินใหม่
            if (response.status === 401) {
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error("❌ Checkout Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
});