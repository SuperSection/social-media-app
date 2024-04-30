import { Router } from "express";
import {
    getUserProfile,
    followUnfollowUser,
    getSuggestedUsers,
    updateUser,
} from "../controllers/user.controller.js";
import { verifyAuthenticatedUser } from "../middlewares/auth.middleware.js";


const router = Router();


// PROTECTED ROUTES
router.get("/profile/:username", verifyAuthenticatedUser, getUserProfile);
router.post("/follow/:userId", verifyAuthenticatedUser, followUnfollowUser);
router.get("/suggested", verifyAuthenticatedUser, getSuggestedUsers);
router.put("/update", verifyAuthenticatedUser, updateUser);


export default router;