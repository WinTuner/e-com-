// 1. แยก Logic การนับจำนวนชิ้นให้เรียกใช้ซ้ำได้ง่าย
function syncCartBadge() {
    const savedCart = localStorage.getItem('shopping_cart');
    let cartData = [];

    try {
        cartData = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        cartData = [];
    }

    const totalQty = cartData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const qtyDisplays = document.querySelectorAll('#cart-total-qty');

    qtyDisplays.forEach(el => {
        el.innerText = `${totalQty} ชิ้น`;
    });
}

// 2. ปรับปรุงระบบตรวจสอบสถานะ Login (เวอร์ชันป้องกัน XSS)
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('user_name');
    
    // เลือกเป้าหมายที่ต้องการเปลี่ยน (รองรับทั้งแบบ class และ id)
    const loginLink = document.querySelector('.dropdown-item[href*="login"]') || 
                      document.querySelector('#login-link'); 

    // ถ้ามี Token และมีปุ่ม Login อยู่บนหน้าจอ
    if (token && userName && loginLink) {
        const parent = loginLink.parentElement;
        parent.innerHTML = ''; // ล้างค่าเดิมออกให้หมดก่อน

        // สร้าง Element ใหม่ด้วย JavaScript เพื่อป้องกัน XSS
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex flex-column p-2 bg-light rounded shadow-sm';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'fw-bold text-primary mb-1 border-bottom pb-1';
        nameSpan.textContent = `👤 Hi, ${userName}`; // ใช้ textContent ปลอดภัยจากการฝัง Script

        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'dropdown-item text-danger py-1';
        logoutBtn.id = 'logoutBtn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt me-1"></i>ออกจากระบบ';

        // ประกอบร่าง
        wrapper.appendChild(nameSpan);
        wrapper.appendChild(logoutBtn);
        parent.appendChild(wrapper);

        // ผูก Event ให้ปุ่ม Logout ที่เพิ่งสร้างขึ้นมาใหม่
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            // ลบเฉพาะข้อมูล Auth ไม่ลบตะกร้าสินค้า
            localStorage.removeItem('token');
            localStorage.removeItem('user_name');
            
            // แจ้งเตือนสวยๆ แล้วพาไปหน้าแรก
            alert('ออกจากระบบเรียบร้อยแล้ว');
            window.location.href = 'index.html'; 
        });
    }
}

// 3. รันฟังก์ชันเมื่อ DOM พร้อม
document.addEventListener('DOMContentLoaded', () => {
    syncCartBadge();
    checkLoginStatus();
});

// 4. ฟัง Event 'storage' แบบครอบคลุม (Cross-Tab Sync)
window.addEventListener('storage', (event) => {
    // อัปเดตทั้งตะกร้าและสถานะ Login ถ้ามีการเปิดหลายแท็บ
    if (['token', 'user_name', 'shopping_cart'].includes(event.key) || event.key === null) {
        syncCartBadge();
        if (typeof checkLoginStatus === 'function') {
            checkLoginStatus(); 
        }
    }
});