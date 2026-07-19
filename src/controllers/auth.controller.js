import User from "../models/user.model.js";

const registerUser = async (req, res) => {
  // Your existing register code
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Require either email or username, plus password
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive fields
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: loggedInUser,
      accessToken,
      refreshToken,
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
};