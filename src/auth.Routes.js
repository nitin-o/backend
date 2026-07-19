import express from "express";


const authRoutes = express.Router();

authRoutes.get("/register", (req, res) => {});
authRoutes.get("/login", (req, res) => {
    res.status(200).json({
    success: true,
    message: "IoT Platform API is running",
  });
    
});
authRoutes.get("/me", (req, res) => {});

export default authRoutes;