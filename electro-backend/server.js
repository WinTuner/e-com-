require('dotenv').config();

const app = require('./src/app');
const db = require('./src/config/database');

// 🛠️ Environment Variable Validation
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'DATABASE_PATH'];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    console.error('❌ [Critical] Missing environment variables:', missingVars.join(', '));
    process.exit(1);
}

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
console.log("🛠️ Testing DB Instance:", typeof db.serialize); // ควรจะขึ้นว่า 'function'

let server;

function startServer(port, retriesLeft = 10) {
    server = app.listen(port, () => {
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

// 🛠️ Graceful Shutdown
function gracefulShutdown(signal) {
    console.log(`\n⚠️ [Process] Received ${signal}. Starting graceful shutdown...`);
    
    if (server) {
        server.close(() => {
            console.log('🛑 [Server] HTTP server closed.');
            
            db.close((err) => {
                if (err) {
                    console.error('❌ [DB] Error closing database:', err.message);
                } else {
                    console.log('📦 [DB] SQLite connection closed.');
                }
                process.exit(0);
            });
        });

        // If server doesn't close in 10s, force exit
        setTimeout(() => {
            console.error('❌ [Process] Shutdown timed out. Forcing exit.');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    console.error('❌ [Process] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ [Process] Uncaught Exception:', error);
});
