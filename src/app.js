import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import loggerMiddleware from "./middleware/logger.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// HTTP Request Logger
app.use(loggerMiddleware);

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

app.use("/api/v1/auth", authRouter);

export default app;
