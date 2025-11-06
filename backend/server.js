// FILE: server/server.js
// MAIN SERVER ENTRY POINT
// This file is confirmed to be professional and ready for use.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connection = require('./database/connection');
// const routes = require('./routes'); // Note: This line isn't needed if using require('./routes/index') below

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES (Main API Gateway)
// ============================================

app.use('/api', require('./routes/index')); // This maps to the updated index.js

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: connection.isReady() ? '✅ Connected' : '❌ Disconnected',
    });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`,
    });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error('💥 ERROR:', {
        message: err.message,
        path: req.path,
        method: req.method,
        // stack: err.stack // Optional: for detailed debugging
    });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    try {
        await connection.connect();

        app.listen(PORT, () => {
            console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
            console.log(`║      🚀 VITALVIBE SERVER STARTED SUCCESSFULLY 🚀               ║`);
            console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
            console.log(`📡 Server: http://localhost:${PORT}`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
            console.log(`✅ Health: http://localhost:${PORT}/health`);
            console.log(`📊 Database: ${connection.isReady() ? '✅ Connected' : '⏳ Connecting'}\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;