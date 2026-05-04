const fs = require('fs');
const path = require('path');

// ชี้ Path ไปที่ไฟล์ products.json ในโฟลเดอร์ data ของเรา
const productsFilePath = path.join(__dirname, '../data/products.json');

// สร้างฟังก์ชันกลางสำหรับอ่านไฟล์ (ใช้ Promise เพื่อให้รองรับ async/await ของ Controller เดิม)
const readProductsFromFile = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(productsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error("❌ [Product Service] Cannot read products.json:", err.message);
                return reject(err);
            }
            try {
                const products = JSON.parse(data);
                resolve(products);
            } catch (parseErr) {
                console.error("❌ [Product Service] JSON Parse Error:", parseErr.message);
                reject(parseErr);
            }
        });
    });
};

// 1. ดึงสินค้าทั้งหมด
const getAllProducts = async () => {
    try {
        const products = await readProductsFromFile();
        return products;
    } catch (error) {
        throw error;
    }
};

// 2. ดึงสินค้าตามหมวดหมู่ (สำหรับตอนคลิก Filter)
const getProductsByCategory = async (category) => {
    try {
        // Gatekeeper Check
        if (!category) throw new Error("Category is required");

        const products = await readProductsFromFile();
        // ใช้ Array.filter() กรองข้อมูลแทน SQL WHERE
        const filteredProducts = products.filter(p => p.category === category);
        return filteredProducts;
    } catch (error) {
        throw error;
    }
};

module.exports = { getProductsByCategory, getAllProducts };