import jwt from "jsonwebtoken";


export const accessTokenCookieOptions = {
  maxAge: 5 * 60 * 60 * 1000, // 5 hours
  sameSite: "strict", // prevents CSRF(cross-site request forgery) attacks
  path: "/",
  httpOnly: true, // make cookie accessible only by web server, prevents XSS(cross-site scripting) attacks
  secure: process.env.NODE_ENV !== "development",
};

export const refreshTokenCookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

export const clearCookieOptions = {
  maxAge: 0,
  path: "/",
};


export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
