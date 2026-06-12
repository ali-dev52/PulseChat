import express from "express";
import { getUsers } from "../controllers/cuserController.js";
import protectRoute from "../middlewares/authMiddleware.js";

import { register } from "../controllers/cuserController.js";
import { login } from "../controllers/cuserController.js";
import { verifyEmail } from "../controllers/cuserController.js";
const router = express.Router();

// ✅ Get all users
router.get("/",protectRoute, getUsers);
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
export default router;