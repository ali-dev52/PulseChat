import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import User from "../models/user.models.js";
import webpush from "../config/webpush.js";
import { io, onlineUsers } from "../server.js";
import { AWSS3 } from "../config/aws.js";

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
    const { conversationId, text, replyTo, audioUrl, image } = req.body; // ✅ replyTo, audioUrl, image added
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    // ✅ Block check
    if (receiverId) {
      const senderUser = await User.findById(senderId);
      const receiverUser = await User.findById(receiverId);

      if (senderUser.blockedUsers?.includes(receiverId)) {
        return res.status(403).json({ error: "You have blocked this user. Unblock them to send messages." });
      }
      if (receiverUser.blockedUsers?.includes(senderId)) {
        return res.status(403).json({ error: "You are blocked by this user." });
      }
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text,
      status: "sent",
      replyTo: replyTo || null, // ✅ save reply reference
      audioUrl: audioUrl || "", // ✅ save audio reference
      image: image || "", // ✅ save image reference
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

          let pushBody = text;
          if (!pushBody) {
             if (image) pushBody = "📷 Photo";
             else if (audioUrl) pushBody = "🎤 Voice Note";
             else pushBody = "New message";
          }

          const payload = JSON.stringify({
            title: `${senderName}`,
            body: pushBody,
            icon: senderAvatar,
            url: `/?chat=${conversationId}`,
            conversationId: conversationId.toString()
          });

          // Run push notifications asynchronously to prevent blocking the API response
          (async () => {
            const validSubscriptions = [];
            let subscriptionsChanged = false;

            await Promise.all(receiverUser.pushSubscriptions.map(async (sub) => {
              try {
                await webpush.sendNotification(sub, payload, { urgency: 'high' });
                validSubscriptions.push(sub);
              } catch (err) {
                // 410 means subscription is no longer valid (e.g., user revoked permission)
                if (err.statusCode === 410 || err.statusCode === 404) {
                  console.log("Removing expired push subscription");
                  subscriptionsChanged = true;
                } else {
                  console.error("Web push error:", err);
                  validSubscriptions.push(sub); // keep if it's a temp error
                }
              }
            }));

            // update db if any subscriptions were removed
            if (subscriptionsChanged) {
              await User.findByIdAndUpdate(receiverId, { pushSubscriptions: validSubscriptions });
            }
          })();
        }
      } catch (err) {
        console.error("Failed to setup push notification:", err);
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

// POST /api/v1/messages/upload-image
export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });

    // Robustly separate the base64 data from the prefix
    const parts = image.split("base64,");
    if (parts.length !== 2) return res.status(400).json({ error: "Invalid image format" });

    const base64Data = Buffer.from(parts[1], "base64");
    
    // figure out extension from mimetype
    const meta = parts[0];
    const typeMatch = meta.match(/^data:image\/([a-zA-Z0-9-]+)/);
    const type = typeMatch ? typeMatch[1] : "jpeg";
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "pulsechat-media",
      Key: `images/${Date.now()}-${req.user._id}.${type}`,
      Body: base64Data,
      ContentType: `image/${type}`,
      // ACL: "public-read",
    };

    const data = await AWSS3.upload(params).promise();
    res.json({ Location: data.Location });
  } catch (err) {
    console.error("uploadImage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/messages/upload-audio
export const uploadAudio = async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ error: "No audio provided" });

    // Robustly separate the base64 data from the prefix
    const parts = audio.split("base64,");
    if (parts.length !== 2) return res.status(400).json({ error: "Invalid audio format" });

    const base64Data = Buffer.from(parts[1], "base64");
    
    // figure out extension from mimetype
    const meta = parts[0];
    const typeMatch = meta.match(/^data:audio\/([a-zA-Z0-9-]+)/);
    const type = typeMatch ? typeMatch[1] : "webm";
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || "pulsechat-media",
      Key: `audio/${Date.now()}-${req.user._id}.${type}`,
      Body: base64Data,
      ContentType: `audio/${type}`,
      // ACL: "public-read",
    };

    const data = await AWSS3.upload(params).promise();
    res.json({ Location: data.Location });
  } catch (err) {
    console.error("uploadAudio error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/messages/stream-audio?url=...
export const streamAudio = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    // Parse the S3 key from the URL
    const bucketName = process.env.AWS_S3_BUCKET || "pulsechat-media";
    const urlObj = new URL(url);
    let key = urlObj.pathname.substring(1);

    if (key.startsWith(bucketName + '/')) {
      key = key.replace(bucketName + '/', '');
    }

    const params = {
      Bucket: bucketName,
      Key: decodeURIComponent(key),
    };

    const request = AWSS3.getObject(params);
    
    request.on('httpHeaders', (statusCode, headers) => {
      res.status(statusCode);
      if (headers['content-type']) res.set('Content-Type', headers['content-type']);
      if (headers['content-length']) res.set('Content-Length', headers['content-length']);
      if (headers['accept-ranges']) res.set('Accept-Ranges', headers['accept-ranges']);
      if (headers['content-range']) res.set('Content-Range', headers['content-range']);
    });

    const s3Stream = request.createReadStream();
    
    s3Stream.on('error', (err) => {
      console.error("streamAudio S3 Error:", err);
      if (!res.headersSent) {
        res.status(404).send("Audio not found");
      }
    });

    s3Stream.pipe(res);
  } catch (err) {
    console.error("streamAudio error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// PUT /api/v1/messages/:messageId/downloaded
export const markAsDownloaded = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Prevent duplicate entries
    if (!message.downloadedBy.includes(userId)) {
      message.downloadedBy.push(userId);
      await message.save();

      const downloader = await User.findById(userId);
      
      const systemMsgText = `${downloader?.full_name || downloader?.name || "User"} saved your ${message.image ? 'photo' : 'voice note'}`;

      const sysMessage = await Message.create({
        conversationId: message.conversationId,
        sender: userId,
        text: systemMsgText,
        status: "sent",
        isSystem: true
      });

      await sysMessage.populate("sender", "_id full_name profilepicture");

      // Update conversation with last message
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.lastMessage = sysMessage._id;
        await conversation.save();
      }

      const socketPayload = {
        ...sysMessage.toObject(),
        conversationId: message.conversationId.toString(),
      };

      // Notify the sender that their media was downloaded
      const senderSocketId = onlineUsers.get(message.sender.toString());
      if (senderSocketId && message.sender.toString() !== userId.toString()) {
        // Emit the system message to the sender
        io.to(senderSocketId).emit("newMessage", socketPayload);
        
        io.to(senderSocketId).emit("messageDownloaded", {
          messageId: message._id,
          downloadedBy: userId,
          conversationId: message.conversationId,
        });

        // Update sender's sidebar
        io.to(senderSocketId).emit("conversationUpdated", socketPayload);
      }
      
      // Also emit the system message to the downloader so they see it too
      const downloaderSocketId = onlineUsers.get(userId.toString());
      if (downloaderSocketId) {
        io.to(downloaderSocketId).emit("newMessage", socketPayload);
        
        // Update downloader's sidebar
        io.to(downloaderSocketId).emit("conversationUpdated", socketPayload);
      }
      
      return res.json({ success: true, message, sysMessage });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error("markAsDownloaded error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/messages/screenshot
export const reportScreenshot = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const user = await User.findById(userId);
    const systemMsgText = `${user?.full_name || user?.name || "User"} captured a screenshot`;

    const sysMessage = await Message.create({
      conversationId: conversation._id,
      sender: userId,
      text: systemMsgText,
      status: "sent",
      isSystem: true
    });

    await sysMessage.populate("sender", "_id full_name profilepicture");

    conversation.lastMessage = sysMessage._id;
    await conversation.save();

    const socketPayload = {
      ...sysMessage.toObject(),
      conversationId: conversation._id.toString(),
    };

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    if (receiverId) {
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", socketPayload);
        io.to(receiverSocketId).emit("conversationUpdated", socketPayload);
      }
    }

    const senderSocketId = onlineUsers.get(userId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", socketPayload);
      io.to(senderSocketId).emit("conversationUpdated", socketPayload);
    }

    res.status(201).json({ success: true, sysMessage });
  } catch (error) {
    console.error("reportScreenshot error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/messages/forward
export const forwardMessage = async (req, res) => {
  try {
    const { messageId, targetConversationId } = req.body;
    const userId = req.user._id;

    const originalMsg = await Message.findById(messageId);
    if (!originalMsg) return res.status(404).json({ error: "Message not found" });

    const rootMessageId = originalMsg.originalMessageId || originalMsg._id;
    const rootMessage = await Message.findById(rootMessageId);
    
    const originalSenderId = rootMessage ? rootMessage.sender.toString() : originalMsg.sender.toString();
    const isOriginalSender = originalSenderId === userId.toString();

    let currentForwardCount = 1;
    if (rootMessage && !isOriginalSender) {
      rootMessage.forwardCount = (rootMessage.forwardCount || 0) + 1;
      currentForwardCount = rootMessage.forwardCount;
      await rootMessage.save();
    }

    const targetConversation = await Conversation.findById(targetConversationId);
    if (!targetConversation) return res.status(404).json({ error: "Target conversation not found" });

    // Create the forwarded message
    const newMsg = await Message.create({
      conversationId: targetConversationId,
      sender: userId,
      text: originalMsg.text,
      image: originalMsg.image,
      audioUrl: originalMsg.audioUrl,
      isForwarded: !isOriginalSender,
      originalMessageId: isOriginalSender ? null : rootMessageId,
      status: "sent"
    });

    await newMsg.populate("sender", "_id full_name profilepicture");

    targetConversation.lastMessage = newMsg._id;
    await targetConversation.save();

    // Emit the forwarded message to the target conversation participants
    const targetPayload = {
      ...newMsg.toObject(),
      conversationId: targetConversationId.toString()
    };

    targetConversation.participants.forEach(p => {
      const socketId = onlineUsers.get(p.toString());
      if (socketId) {
        io.to(socketId).emit("newMessage", targetPayload);
        io.to(socketId).emit("conversationUpdated", targetPayload);
      }
    });

    // If it's not the original sender forwarding it, run all the notification and update logic
    if (!isOriginalSender) {
      // Only send the system notification to the root message's conversation
      const rootConvId = rootMessage ? rootMessage.conversationId.toString() : originalMsg.conversationId.toString();
      
      let mediaType = "message";
      if (originalMsg.image) mediaType = "photo";
      else if (originalMsg.audioUrl) mediaType = "voice note";
      else if (originalMsg.text) mediaType = `message "${originalMsg.text.substring(0, 20)}${originalMsg.text.length > 20 ? '...' : ''}"`;

      const forwardingUser = await User.findById(userId);
      const userName = forwardingUser?.full_name || forwardingUser?.name || "User";
      const notifyText = `${userName} forwarded this ${mediaType}. Total forwards: ${currentForwardCount}`;

      const rootConv = await Conversation.findById(rootConvId);
      if (rootConv) {
        let notifyMsg = await Message.findOne({
          conversationId: rootConvId,
          isSystem: true,
          originalMessageId: rootMessageId
        });

        if (notifyMsg) {
          notifyMsg.text = notifyText;
          await notifyMsg.save();
          await notifyMsg.populate("sender", "_id full_name profilepicture");

          rootConv.lastMessage = notifyMsg._id;
          await rootConv.save();

          const notifyPayload = {
            ...notifyMsg.toObject(),
            conversationId: rootConvId
          };

          rootConv.participants.forEach(p => {
            const socketId = onlineUsers.get(p.toString());
            if (socketId) {
              io.to(socketId).emit("messageEdited", notifyPayload);
              io.to(socketId).emit("conversationUpdated", notifyPayload);
            }
          });
        } else {
          notifyMsg = await Message.create({
            conversationId: rootConvId,
            sender: userId,
            text: notifyText,
            isSystem: true,
            originalMessageId: rootMessageId,
            status: "sent"
          });
          await notifyMsg.populate("sender", "_id full_name profilepicture");
          rootConv.lastMessage = notifyMsg._id;
          await rootConv.save();

          const notifyPayload = {
            ...notifyMsg.toObject(),
            conversationId: rootConvId
          };

          rootConv.participants.forEach(p => {
            const socketId = onlineUsers.get(p.toString());
            if (socketId) {
              io.to(socketId).emit("newMessage", notifyPayload);
              io.to(socketId).emit("conversationUpdated", notifyPayload);
            }
          });
        }
      }

      // Update forwardCount on ALL copies of this message and emit messageEdited
      await Message.updateMany(
        { $or: [{ _id: rootMessageId }, { originalMessageId: rootMessageId }] },
        { $set: { forwardCount: currentForwardCount } }
      );

      const allForwardsAfterUpdate = await Message.find({
        $or: [{ _id: rootMessageId }, { originalMessageId: rootMessageId }]
      });

      for (const msg of allForwardsAfterUpdate) {
        const convId = msg.conversationId.toString();
        if (convId === targetConversationId.toString() && msg._id.toString() === newMsg._id.toString()) continue;

        const c = await Conversation.findById(convId);
        if (!c) continue;

        // Ensure we populate sender before emitting messageEdited
        await msg.populate("sender", "_id full_name profilepicture");

        const payload = {
          ...msg.toObject(),
          conversationId: convId
        };

        c.participants.forEach(p => {
          const socketId = onlineUsers.get(p.toString());
          if (socketId) {
            io.to(socketId).emit("messageEdited", payload);
          }
        });
      }
    }

    // Make sure newMsg returns with the updated count if it was updated above
    const updatedNewMsg = await Message.findById(newMsg._id).populate("sender", "_id full_name profilepicture");

    res.status(201).json({ success: true, message: updatedNewMsg });

  } catch (error) {
    console.error("forwardMessage error:", error);
    res.status(500).json({ error: error.message });
  }
};