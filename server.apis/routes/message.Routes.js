import express from "express";
import {
  sendMessage,
  getMessages,
  markAsSeen,
  deleteMessage,
  editMessage,
  sendPulse,
  uploadAudio,
  uploadImage,
  streamAudio,
  markAsDownloaded,
} from "../controllers/messageController.js";
import protectRoute from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stream-audio", streamAudio);
router.get("/:conversationId", protectRoute, getMessages);
router.post("/upload-audio", protectRoute, uploadAudio);
router.post("/upload-image", protectRoute, uploadImage);
router.post("/", protectRoute, sendMessage);
router.post("/pulse", protectRoute, sendPulse);
router.put("/seen/:conversationId", protectRoute, markAsSeen);
router.put("/:messageId/downloaded", protectRoute, markAsDownloaded);
router.put("/:messageId/edit", protectRoute, editMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;