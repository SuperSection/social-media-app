import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";


const cookieOptions = {
  maxAge: 2 * 60 * 60 * 1000, // 2 hours
  sameSite: "strict", // prevents CSRF(cross-site request forgery) attacks
  path: "/",
  httpOnly: true, // make cookie accessible only by web server, prevents XSS(cross-site scripting) attacks
  secure: process.env.NODE_ENV !== "development",
};


/**
 * Register a new User
 */
const signUp = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email. Please provide a valid email." });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const newUser = await User.create({ fullName, email, username, password });

    if (!newUser) {
      return res.status(400).json({ message: "User registration failed." });
    }

    const { accessToken } = await generateAccessAndRefreshTokens(newUser._id, res);

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    return res
      .status(201)
      .cookie("socialToken", accessToken, cookieOptions)
      .json({
        message: "User registered successfully.",
        user: createdUser,
      });
    
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};


const signIn = async(req, res) => {
    res.json({
      message: "Sign in endpoint",
    });
}


const logout = async(req, res) => {
    res.json({
      message: "Logout endpoint",
    });
}


export { signUp, signIn, logout };