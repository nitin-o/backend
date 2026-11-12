import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRouter from "./routes/auth.routes.js";
import loggerMiddleware from "./middleware/logger.middleware.js";

const app = express();

// ======================================
// Core Middleware
// ======================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================================
// CORS Configuration
// ======================================

app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ======================================
// HTTP Request Logger
// ======================================

app.use(loggerMiddleware);

// ======================================
// Root Route
// ======================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Server is running",
        data: {
            name: "IoT Platform API",
            version: "1.0.0"
        }
    });
});

// ======================================
// Backend and MongoDB Health Check
// ======================================

app.get("/api/v1/health", (req, res) => {
    const dbState = mongoose.connection.readyState;

    const dbStatus = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Disconnecting"
    };

    const isConnected = dbState === 1;

    res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        statusCode: isConnected ? 200 : 503,
        backend: "Running",
        mongodb: dbStatus[dbState] || "Unknown",
        timestamp: new Date().toISOString()
    });
});

// ======================================
// Authentication Routes
// ======================================

app.use("/api/v1/auth", authRouter);

// ======================================
// Export
// ======================================

export default app;
