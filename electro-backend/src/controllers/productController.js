const productService = require('../services/productService');

// ใน src/controllers/productController.js
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let products = (category && category !== "All Category") 
            ? await productService.getProductsByCategory(category)
            : await productService.getAllProducts();

        res.status(200).json(products);
    } catch (error) {
        // บันทึกลง Log ของ Server เท่านั้น
        console.error('❌ Internal Server Error:', error); 
        // ส่งข้อความกลางๆ กลับไปหา User
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลสินค้าได้ในขณะนี้" });
    }
};

module.exports = { getProducts };