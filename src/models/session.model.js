
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        refreshTokenHash: {
            type: String,
            required: true,
            select: false,
        },

        deviceInfo: {
            type: String,
            default: "Unknown Device",
            trim: true,
        },

        clientType: {
            type: String,
            enum: ["android", "web", "other"],
            default: "other",
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically delete expired sessions
sessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
