
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import {
  hashToken,
  getTokenExpiryDate,
} from "../utils/token.utils.js";
import jwt from "jsonwebtoken";

// Register User
const registerUser = async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      fullName,
      username,
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select("-password");

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: createdUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password are required",
      });
    }

    const conditions = [];
    if (email) conditions.push({ email });
    if (username) conditions.push({ username });

    const user = await User.findOne({ $or: conditions });

    if (!user || !(await user.isPasswordCorrect(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password",
      });
    }

    // Generate a unique Session ID
    const sessionId = new (await import("mongoose")).default.Types.ObjectId();

    // Generate Tokens
    const accessToken = user.generateAccessToken(sessionId);
    const refreshToken = user.generateRefreshToken(sessionId);

    // Save hashed Refresh Token in Session
    const session = await Session.create({
      _id: sessionId,
      user: user._id,
      refreshTokenHash: hashToken(refreshToken),
      deviceInfo: req.get("user-agent") || "Unknown Device",
      clientType: ["android", "web", "other"].includes(req.body.clientType)
    ? req.body.clientType
    : "other",
      expiresAt: getTokenExpiryDate(refreshToken),
    });

    const loggedInUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: loggedInUser,
      accessToken,
      refreshToken,
      sessionId: session._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout Current Session
const logoutUser = async (req, res) => {
  try {
    if (!req.session || req.session.revokedAt) {
      return res.status(401).json({
        success: false,
        message: "Session already logged out or expired.",
      });
    }

    req.session.revokedAt = new Date();
    await req.session.save();

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken =
            req.body.refreshToken ||
            req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required.",
            });
        }

        // Verify Refresh Token
        let decodedToken;

        try {
            decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token.",
            });
        }

        if (!decodedToken.sid || !decodedToken._id) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token session.",
            });
        }

        // Find active Session
        const session = await Session.findOne({
            _id: decodedToken.sid,
            user: decodedToken._id,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
        }).select("+refreshTokenHash");

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Session expired or revoked. Please login again.",
            });
        }

        // Verify Refresh Token Hash
        const incomingTokenHash = hashToken(incomingRefreshToken);

        if (incomingTokenHash !== session.refreshTokenHash) {
            session.revokedAt = new Date();
            await session.save();

            return res.status(401).json({
                success: false,
                message: "Refresh token reuse detected. Please login again.",
            });
        }

        // Find User
        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        // Generate New Tokens
        const newAccessToken = user.generateAccessToken(session._id);
        const newRefreshToken = user.generateRefreshToken(session._id);

        // Update Session with New Refresh Token Hash
        session.refreshTokenHash = hashToken(newRefreshToken);
        session.expiresAt = getTokenExpiryDate(newRefreshToken);
        session.lastUsedAt = new Date();

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully.",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Get Current Logged-in User
const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Current user fetched successfully",
            user: req.user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};