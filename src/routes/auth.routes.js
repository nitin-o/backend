import { verifyJWT } from "../middleware/auth.middleware.js";
import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    // changePassword,
    // forgotPassword,
    // resetPassword,
    getCurrentUser,
    // updateUserProfile,
} from "../controllers/auth.controller.js";

const router = Router();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);


// Future Authentication Features
// router.post("/change-password", changePassword);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);

// User Routes
router.get("/current-user", verifyJWT, getCurrentUser);
// router.patch("/update-profile", updateUserProfile);

export default router;
