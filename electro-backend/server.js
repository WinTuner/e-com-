const app = require('./src/app');
const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const db = require('./src/config/database');
console.log("🛠️ Testing DB Instance:", typeof db.serialize); // ควรจะขึ้นว่า 'function'

function startServer(port, retriesLeft = 10) {
    const server = app.listen(port, () => {
        console.log(`🚀 Backend Architect: Server is active on http://localhost:${port}`);
    });

    // Keep the HTTP server referenced in the event loop and log lifecycle events.
    server.ref();

    server.on('error', (error) => {
        if (error && error.code === 'EADDRINUSE' && retriesLeft > 0) {
            const nextPort = port + 1;
            console.warn(`⚠️ [Server] Port ${port} is busy. Retrying on ${nextPort}...`);
            startServer(nextPort, retriesLeft - 1);
            return;
        }

        console.error('❌ [Server] Failed to start or runtime error:', error);
    });

    server.on('close', () => {
        console.warn('⚠️ [Server] HTTP server was closed.');
    });
}

startServer(DEFAULT_PORT);

process.on('unhandledRejection', (reason) => {
    console.error('❌ [Process] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ [Process] Uncaught Exception:', error);
});
