import { Router } from "express";
import { logout, signIn, signUp } from "../controllers/auth.controller.js";

const router = Router();

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

router.post("/logout", logout);


export default router;