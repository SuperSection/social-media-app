import { Router } from "express";
import {
  getMyData,
  logout,
  refreshAccessToken,
  signIn,
  signUp,
} from "../controllers/auth.controller.js";
import { verifyAuthenticatedUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);

// PROTECTED ROUTES
router.post("/logout", verifyAuthenticatedUser, logout);
router.get("/profile", verifyAuthenticatedUser, getMyData);
router.post("/refresh-token", refreshAccessToken);

export default router;
