import mongoose from "mongoose";

const cuserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    profilePic: String,

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
    },
    isVerified: { type: Boolean, default: false },  // ✅ new
  verificationToken: String, 
  },
  { timestamps: true }
);

export default mongoose.model("cuser", cuserSchema);
