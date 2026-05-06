const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let products;

        // แยก Logic การดึงตามหมวดหมู่ หรือทั้งหมด
        if (category && category !== "All Category") {
            products = await productService.getProductsByCategory(category);
        } else {
            products = await productService.getAllProducts();
        }

        // 🌟 ส่ง Object กลับไปให้หน้าบ้าน (Frontend) รับค่าไปแสดงผล
        res.status(200).json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('❌ Internal Server Error:', error); 
        res.status(500).json({ 
            success: false, 
            message: "ไม่สามารถดึงข้อมูลสินค้าได้ในขณะนี้" 
        });
    }
};

module.exports = { getProducts };