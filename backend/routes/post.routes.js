import { Router } from "express";
import { verifyAuthenticatedUser } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getAllPosts,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/post.controller.js";


const router = Router();


// PROTECTED ROUTES
router.get("/all", verifyAuthenticatedUser, getAllPosts);
router.get("/liked/:userId", verifyAuthenticatedUser, getLikedPosts);
router.get("/user/:username", verifyAuthenticatedUser, getUserPosts);
router.get("/following", verifyAuthenticatedUser, getFollowingPosts);
router.post("/create", verifyAuthenticatedUser, createPost);
router.post("/like/:postId", verifyAuthenticatedUser, likeUnlikePost);
router.post("/comment/:postId", verifyAuthenticatedUser, commentOnPost);
router.delete("/:postId", verifyAuthenticatedUser, deletePost);


export default router;