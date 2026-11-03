
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        const token =
            req.cookies?.accessToken ||
            (authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized request. Access token is required.",
            });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        // Check Session ID
        if (!decodedToken.sid) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token. Session ID missing.",
            });
        }

        // Find active session
        const session = await Session.findOne({
            _id: decodedToken.sid,
            user: decodedToken._id,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Session expired or logged out. Please login again.",
            });
        }

        // Find user
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token.",
            });
        }

        // Attach user and session
        req.user = user;
        req.session = session;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token.",
        });
    }
};

export { verifyJWT };
