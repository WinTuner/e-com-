const fs = require('fs').promises;
const path = require('path');

// กำหนด Path ของไฟล์ JSON
const dataPath = path.join(__dirname, '../data/products.json');

const getAllProducts = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Error reading products data');
    }
};

module.exports = { getAllProducts };