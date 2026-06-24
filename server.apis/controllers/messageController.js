import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import User from "../models/user.models.js";
import webpush from "../config/webpush.js";
import { io, onlineUsers } from "../server.js";

// GET /api/v1/messages/:conversationId
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message
      .find({ conversationId })
      .populate("sender", "_id full_name profilepicture")
      .populate({
        path: "replyTo",
        select: "_id text sender",
        populate: {
          path: "sender",
          select: "_id full_name profilepicture",
        },
      }) // ✅ populate reply and reply sender
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/messages
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, replyTo } = req.body; // ✅ replyTo added
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text,
      status: "sent",
      replyTo: replyTo || null, // ✅ save reply reference
    });

    await newMessage.populate("sender", "_id full_name profilepicture");
    await newMessage.populate({
      path: "replyTo",
      select: "_id text sender",
      populate: {
        path: "sender",
        select: "_id full_name profilepicture",
      },
    }); // ✅ populate reply and reply sender

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    // update conversation lastMessage + unread
    conversation.lastMessage = newMessage._id;
    if (receiverId) {
      const count = conversation.unreadCount.get(receiverId.toString()) || 0;
      conversation.unreadCount.set(receiverId.toString(), count + 1);
    }
    await conversation.save();

    const socketPayload = {
      ...newMessage.toObject(),
      conversationId: conversation._id.toString(),
    };

    // ✅ emit to receiver — full message with bubble + sidebar update
    if (receiverId) {
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", socketPayload);

        // ✅ auto mark as delivered if receiver is online
        await Message.findByIdAndUpdate(newMessage._id, {
          status: "delivered",
          $addToSet: { deliveredTo: receiverId },
        });

        // ✅ notify sender message was delivered
        const senderSocketId = onlineUsers.get(senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageStatusUpdated", {
            messageId: newMessage._id.toString(),
            status: "delivered",
          });
        }
      }
      
      // ✅ Web Push Notification
      try {
        const receiverUser = await User.findById(receiverId);
        if (receiverUser && receiverUser.pushSubscriptions && receiverUser.pushSubscriptions.length > 0) {
          // get sender details for notification
          const senderUser = await User.findById(senderId);
          const senderName = senderUser?.full_name || "Someone";
          const senderAvatar = senderUser?.profilepicture || "/favicon.png";

          const payload = JSON.stringify({
            title: `${senderName}`,
            body: text,
            icon: senderAvatar,
            url: `/?chat=${conversationId}`,
            conversationId: conversationId.toString()
          });

          // Send to all registered devices
          const validSubscriptions = [];
          for (const sub of receiverUser.pushSubscriptions) {
            try {
              await webpush.sendNotification(sub, payload);
              validSubscriptions.push(sub);
            } catch (err) {
              // 410 means subscription is no longer valid (e.g., user revoked permission)
              if (err.statusCode === 410 || err.statusCode === 404) {
                console.log("Removing expired push subscription");
              } else {
                console.error("Web push error:", err);
                validSubscriptions.push(sub); // keep if it's a temp error
              }
            }
          }

          // update db if any subscriptions were removed
          if (validSubscriptions.length !== receiverUser.pushSubscriptions.length) {
            receiverUser.pushSubscriptions = validSubscriptions;
            await receiverUser.save();
          }
        }
      } catch (err) {
        console.error("Failed to send push notification:", err);
      }
    }

    // ✅ emit to sender — sidebar update only, no duplicate bubble
    const senderSocketId = onlineUsers.get(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("conversationUpdated", socketPayload);
    }

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/v1/messages/seen/:conversationId
// export const markAsSeen = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.user._id;

//     // get all unseen messages from other person
//     const unseenMessages = await Message.find({
//       conversationId,
//       sender: { $ne: userId },
//       status: { $ne: "seen" },
//     });

//     if (unseenMessages.length > 0) {
//       // update all to seen
//       await Message.updateMany(
//         {
//           conversationId,
//           sender: { $ne: userId },
//           status: { $ne: "seen" },
//         },
//         {
//           $set: { status: "seen" },
//           $addToSet: { seenBy: userId },
//         }
//       );

//       const conv = await Conversation.findById(conversationId);
//       if (conv) {
//         conv.unreadCount.set(userId.toString(), 0);
//         await conv.save();

//         // ✅ notify sender all messages seen
//         const otherUserId = conv.participants.find(
//           (p) => p.toString() !== userId.toString()
//         );
//         if (otherUserId) {
//           const otherSocketId = onlineUsers.get(otherUserId.toString());
//           if (otherSocketId) {
//             // emit seen for each message
//             unseenMessages.forEach((msg) => {
//               io.to(otherSocketId).emit("messageStatusUpdated", {
//                 messageId: msg._id.toString(),
//                 status: "seen",
//               });
//             });
//             // also emit bulk seen event
//             io.to(otherSocketId).emit("messagesSeen", {
//               conversationId,
//               seenBy: userId.toString(),
//             });
//           }
//         }
//       }
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("markAsSeen error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// PUT /api/v1/messages/seen/:conversationId
export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const unseenMessages = await Message.find({
      conversationId,
      sender: { $ne: userId },
      status: { $ne: "seen" },
    });

    if (unseenMessages.length > 0) {
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId },
          status: { $ne: "seen" },
        },
        {
          $set: { status: "seen" },
          $addToSet: { seenBy: userId },
        }
      );

      const conv = await Conversation.findById(conversationId);
      if (conv) {
        conv.unreadCount.set(userId.toString(), 0);
        await conv.save();

        const otherUserId = conv.participants.find(
          (p) => p.toString() !== userId.toString()
        );

        // ✅ emit to sender — their ticks turn blue
        if (otherUserId) {
          const otherSocketId = onlineUsers.get(otherUserId.toString());
          if (otherSocketId) {
            unseenMessages.forEach((msg) => {
              io.to(otherSocketId).emit("messageStatusUpdated", {
                messageId: msg._id.toString(),
                status: "seen",
              });
            });
            io.to(otherSocketId).emit("messagesSeen", {
              conversationId,
              seenBy: userId.toString(),
            });
          }
        }

        // ✅ emit back to receiver themselves — resets their unread badge
        const receiverSocketId = onlineUsers.get(userId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messagesSeen", {
            conversationId,
            seenBy: userId.toString(),
          });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("markAsSeen error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/v1/messages/:messageId
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    if (msg.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const conversation = await Conversation.findById(msg.conversationId);
    const receiverId = conversation?.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    msg.isDeleted = true;
    msg.text = "";
    await msg.save();

    // ✅ notify receiver
    if (receiverId) {
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", {
          messageId,
          conversationId: msg.conversationId.toString(),
        });
      }
    }

    // ✅ notify sender
    const senderSocketId = onlineUsers.get(userId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", {
        messageId,
        conversationId: msg.conversationId.toString(),
      });
    }

    res.json({ success: true, messageId });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/v1/messages/:messageId/edit
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text cannot be empty" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    if (msg.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not allowed" });
    }

    msg.text = text.trim();
    msg.editedAt = new Date();
    await msg.save();

    await msg.populate("sender", "_id full_name profilepicture");

    const conversation = await Conversation.findById(msg.conversationId);
    const receiverId = conversation?.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    // ✅ notify receiver
    if (receiverId) {
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageEdited", {
          messageId,
          text: msg.text,
          editedAt: msg.editedAt,
          conversationId: msg.conversationId.toString(),
        });
      }
    }

    res.json({ success: true, message: msg });
  } catch (error) {
    console.error("editMessage error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/messages/pulse
export const sendPulse = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    if (receiverId) {
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receivePulse", {
          conversationId: conversation._id.toString(),
          senderId: senderId.toString(),
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("sendPulse error:", error);
    res.status(500).json({ error: error.message });
  }
};