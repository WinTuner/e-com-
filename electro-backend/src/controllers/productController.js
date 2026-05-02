const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        // 3. Processing: Server opens the envelope
        const { category } = req.query; // รับค่าจาก ?category=...

        let products;
        if (category && category !== "All Category") {
            // Fetch by specific category
            products = await productService.getProductsByCategory(category);
        } else {
            // Fetch all
            products = await productService.getAllProducts();
        }

        // 4. Response: Server sends back "Package" (JSON) and "Status" (Success)
        res.status(200).json(products);
    } catch (error) {
        // Response: Status Fail
        res.status(500).json({ message: "Failed to fetch data", error: error.message });
    }
};

module.exports = { getProducts };