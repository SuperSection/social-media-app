import { Router } from "express";
import {
    getUser,
    logout,
    refreshAccessToken,
    signIn,
    signUp,
} from "../controllers/auth.controller.js";
import { verifyAuthenticatedUser } from "../middlewares/verifyAuthenticatedUser.js";


const router = Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);


// PROTECTED ROUTES
router.post("/logout", verifyAuthenticatedUser, logout);
router.get("/profile", verifyAuthenticatedUser, getUser);
router.post("/refresh-token", refreshAccessToken);


export default router;