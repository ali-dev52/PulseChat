import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import User from "../models/user.models.js"; // ✅ use main user model

const protectRoute = async (req, res, next) => {
  try {
    // ✅ strip Bearer prefix
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ use main users model
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default protectRoute;