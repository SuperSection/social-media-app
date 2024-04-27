import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


// Generate an access token with a shorter lifespan for immediate use
const generateAccessToken = async (userId) => {
  const payload = {
    userId,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};


// Generate a refresh token with a longer lifespan for obtaining new access tokens
const generateRefreshToken = async (userId) => {
  const payload = {
    userId,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};


/**
 *  Generate Access Token and Refresh Token and set cookie.
 */
const generateAccessAndRefreshTokens = async (userId, res) => {
  try {
    const accessToken = await generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(userId);

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    // Assign the refresh token to the user object, ensuring type safety
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while generating tokens and setting cookie.",
    });
  }
};


export { generateAccessAndRefreshTokens };