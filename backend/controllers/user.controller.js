import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


/**
 * Get the User Profile with the given username in the param
 */
const getUserProfile = async (req, res) => {
  console.log(req.params);
  const { username } = req.params;

  try {
      const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Internal Server Error while Getting the User Profile",
        error: error.message,
      });
  }
};


/**
 * Follow or Unfollow the User with the given userId 
 */
const followUnfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow or unfollow yourself." });
    }

    const userToFollowOrUnfollow = await User.findById(userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollowOrUnfollow || !currentUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      /* Unfollow the user */
      await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: userId } });

      // TODO: return the id of the user as a response
      res.status(200).json({ message: "User unfollowed successfully." });
    } else {
      /* Follow the user */
      await User.findByIdAndUpdate(userId, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: userId } });

      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userId,
      });

      await newNotification.save();

      // TODO: return the id of the user as a response
      res.status(200).json({ message: "User followed successfully." });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while following / unfollowing a User",
      error: error.message,
    });
  }
};


/**
 * Get the User suggestions to follow
 */
const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following")

    const users = await User.aggregate([
      {
        $match: {
          _id: { $nin: [userId, ...usersFollowedByMe.following] },
        },
      },
      { $sample: { size: 10 } },
      { $project: { password: 0 } },
    ]);

    const suggestedUsers = users.slice(0, 5);

    res.status(200).json(suggestedUsers);
    
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while Getting Suggested Users",
      error: error.message,
    });
  }
};


/**
 * Update the User Profile
 */
const updateUser = async (req, res) => {
  const { fullName, bio, link, currentPassword, newPassword, profilePicture, coverImage } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select("+password");

    if (!user) return res.status(404).json({ error: "User not found" });

    if ((!currentPassword && newPassword) || (!newPassword && currentPassword)) {
      return res
        .status(400)
        .json({
          error: "Please provide both current password and new password.",
        });
    }

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await user.comparePassword(currentPassword);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Incorrect current password." });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }

      user.password = newPassword;
    }

    if (profilePicture) {
      if (user.profilePicture) {
        await cloudinary.uploader.destroy(user.profilePicture.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePicture);
      profilePicture = uploadedResponse.secure_url;
    }

    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImage);
      coverImage = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profilePicture = profilePicture || user.profilePicture;
    user.coverImage = coverImage || user.coverImage;

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    return res
      .status(200)
      .json({ message: "Updated successfully.", user: updatedUser });

  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Internal Server Error while Updating the User Profile",
        error: error.message,
      });
  }
};



export { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser };