import express from "express";
import {
  getConversations,
  createConversation,
} from "../controllers/conversationController.js";
import protectRoute from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protectRoute, getConversations);
router.post("/", protectRoute, createConversation); 

export default router;