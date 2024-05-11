import { v2 as cloudinary } from 'cloudinary';

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


/**
 * Create new Post
 */
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have conte text or image." });
    }

    if (img) {
      const uploadedImg = await cloudinary.uploader.upload(img);
      img = uploadedImg.secure_url;
    }
      
    const newPost = await Post.create({
      author: userId,
      text,
      img,
    });

    res
      .status(201)
      .json({ message: "Post created successfully.", post: newPost });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Creating New Post.",
      error: error.message,
    });
  }
};



/**
 * Get all Posts
 */
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "-email" })
      .populate({ path: "comments.user", select: "-email" });

    if (posts.length === 0) {
      return res
        .status(200)
        .json({ posts: [] });
    }

    res.status(200).json({ message: "Posts fetched successfully.", posts });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Fetching all Posts.",
      error: error.message,
    });
  }
};



/**
 * Delete a Post 
 */
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this post." });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully." });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Deleting Post.",
      error: error.message,
    });
  }
};



/**
 * Comment on Post (by the `postId` from params)
 */
const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required." });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    post.comments.push({ user: userId, text });
    await post.save();

    // Comment on a post notification
    await Notification.create({
      from: userId,
      to: post.author,
      type: "comment",
    });

    res.status(200).json({ message: "Comment added successfully.", post });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while Adding Comment.",
      error: error.message,
    });
  }
};



/**
 * Like or Revert the Like on a Post
 */
const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const hasUserLikedThePost = post.likes.includes(userId);

    if (hasUserLikedThePost) {
      // Unlike the post (revert liking)
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "Post unliked successfully." });

    } else {
      // Like the post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // Like on a post notification
      await Notification.create({
        from: userId,
        to: post.author,
        type: "like",
      });

      res.status(200).json({ message: "Post liked successfully." });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while Liking or Reverting the Like on a Post.",
      error: error.message,
    });
  }
}



/**
 * Get Liked Posts (using the `userId` from params)
 */
const getLikedPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "author", select: "-email" })
      .populate({ path: "comments.user", select: "-email" });

    res.status(200).json(likedPosts);
    
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Fetching Liked Posts.",
      error: error.message,
    });
  }
};



/**
 * Get Posts from the Followings
 */
const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const followingUers = user.following;

    const feedPosts = await Post.find({ author: { $in: followingUers } })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "-email" })
      .populate({ path: "comments.user", select: "-email" });
    
    res.status(200).json(feedPosts);
    
  } catch (error) {
   return res.status(500).json({
      message: "Internal Server Error while Fetching Posts from the Followings.",
      error: error.message,
    }); 
  }
}


/**
 * Get Posts by a User (using the `username` from params)
 */
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "-email" })
      .populate({ path: "comments.user", select: "-email" });

    res.status(200).json(posts);

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while Fetching Posts by a User.",
      error: error.message,
    });
  }
};



export {
  createPost,
  getAllPosts,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
};