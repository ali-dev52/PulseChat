import express from "express";
import protectRoute, { isAdminRoute } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllConversations,
  getConversationMessages,
  deleteMessage,
  deleteConversation
} from "../controllers/adminController.js";

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(protectRoute);
router.use(isAdminRoute);

router.get("/stats", getDashboardStats);

router.get("/users", getAllUsers);
router.put("/users/:userId/status", updateUserStatus);

// Chat Management
router.get("/conversations", getAllConversations);
router.get("/conversations/:id/messages", getConversationMessages);
router.delete("/messages/:id", deleteMessage);
router.delete("/conversations/:id", deleteConversation);

export default router;
