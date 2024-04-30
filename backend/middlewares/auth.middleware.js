import User from "../models/user.model.js";
import { accessTokenCookie } from "../constants.js";
import { verifyAccessToken } from "../utils/helper.js";


export const verifyAuthenticatedUser = async (req, res, next) => {
  try {
    const token =
      req.cookies[accessTokenCookie] ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized request: No Token Provided." });
    }

    const decodedToken = verifyAccessToken(token);
    if (!decodedToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized access: Invalid Access Token" });
    }

    const user = await User.findById(decodedToken.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user;
    next();
    
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while verifying User Authentication.",
      error: error.message,
    });
  }
};