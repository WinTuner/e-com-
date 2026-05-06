const app = require('./src/app');
const PORT = process.env.PORT || 3000;
const db = require('./src/config/database');
console.log("🛠️ Testing DB Instance:", typeof db.serialize); // ควรจะขึ้นว่า 'function'
app.listen(PORT, () => {
    console.log(`🚀 Backend Architect: Server is active on http://localhost:${PORT}`);
});
