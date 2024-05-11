import User from "../models/user.model.js";
import {
  accessTokenCookieOptions,
  clearCookieOptions,
  refreshTokenCookieOptions,
  verifyRefreshToken,
} from "../utils/helper.js";
import { accessTokenCookie, refreshTokenCookie } from "../constants.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";


/**
 * Register a new User
 */
const signUp = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Invalid email. Please provide a valid email." });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    const newUser = await User.create({ fullName, email, username, password });

    if (!newUser) {
      return res.status(400).json({ error: "User registration failed." });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id, res);

    const createdUser = await User.findById(newUser._id);

    return res
      .status(201)
      .cookie(accessTokenCookie, accessToken, accessTokenCookieOptions)
      .cookie(refreshTokenCookie, refreshToken, refreshTokenCookieOptions)
      .json({
        message: "User registered successfully.",
        user: createdUser,
      });
    
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Internal Server Error while Signing Up",
        error: error.message,
      });
  }
};


/**
 * Login an existing User
 */
const signIn = async(req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const user = await User.findOne({ username }).select("+password");
    const isPasswordCorrect = await user.comparePassword(password);

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, res);

    const loggedInUser = await User.findById(user._id);
    if (!loggedInUser) {
      return res.status(400).json({ error: "User not found." });
    }

    return res
      .status(200)
      .cookie(accessTokenCookie, accessToken, accessTokenCookieOptions)
      .cookie(refreshTokenCookie, refreshToken, refreshTokenCookieOptions)
      .json({
        message: "User signed in successfully.",
        user: loggedInUser,
      });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while Signing In",
      error: error.message,
    });
  }
}


/**
 * Logout a logged in User
 */
const logout = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    return res
      .status(200)
      .clearCookie(accessTokenCookie, clearCookieOptions)
      .clearCookie(refreshTokenCookie, clearCookieOptions)
      .json({ message: "User logged out successfully." });
    
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while Logging Out",
      error: error.message,
    });
  }
};


/**
 * Get the authenticated User
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json(user);
    
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while getting the Authenticated User data",
      error: error.message,
    });
  }
}


/**
 * Refresh the access token for a logged in User
 */
const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies[refreshTokenCookie] || req.body[refreshTokenCookie];

    if (!incomingRefreshToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized request: No Token Provided." });
    }

    const decodedToken = verifyRefreshToken(incomingRefreshToken);

    if (!decodedToken) {
      return res.status(400).json({ error: "Invalid Token Request." });
    }

    const user = await User.findById(decodedToken.userId).select("refreshToken");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized access: Invalid Refresh Token." });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, res);

    return res
      .status(200)
      .cookie(accessTokenCookie, accessToken, accessTokenCookieOptions)
      .cookie(refreshTokenCookie, refreshToken, refreshTokenCookieOptions)
      .json({ message: "Access token refreshed." });
    
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while refreshing Access Token",
      error: error.message,
    });
  }
};



export { signUp, signIn, logout, getUser, refreshAccessToken };