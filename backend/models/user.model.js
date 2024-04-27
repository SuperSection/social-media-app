import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
    },
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minLength: 6,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profilePicture: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    bio: {
      type: String,
    },
    link: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});


const User = mongoose.model("User", userSchema);

export default User;