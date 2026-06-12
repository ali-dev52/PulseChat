import Conversation from "../models/conversation.js";

// GET /api/v1/conversations/:userId
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation
      .find({ participants: { $in: [userId] } })
      .populate("participants", "full_name profilepicture isOnline lastSeen email createdAt bio city phonenumber gender")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "_id full_name",
        },
      })
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      const unreadCount = {};
      if (conv.unreadCount) {
        conv.unreadCount.forEach((value, key) => {
          unreadCount[key] = value;
        });
      }

      return {
        _id: conv._id,
        user: otherUser
          ? {
              _id: otherUser._id,
              full_name: otherUser.full_name,
              profilepicture: otherUser.profilepicture,
              isOnline: otherUser.isOnline || false,
              lastSeen: otherUser.lastSeen,
              email: otherUser.email,
              createdAt: otherUser.createdAt,
              bio: otherUser.bio,
              city: otherUser.city,
              phonenumber: otherUser.phonenumber,
              gender: otherUser.gender,
            }
          : null,
        lastMessage: conv.lastMessage
          ? {
              _id: conv.lastMessage._id,
              text: conv.lastMessage.text,
              sender: conv.lastMessage.sender,
              status: conv.lastMessage.status,
              createdAt: conv.lastMessage.createdAt,
              isDeleted: conv.lastMessage.isDeleted,
            }
          : null,
        unreadCount,
        isFavorite: conv.isFavorite || false,
        updatedAt: conv.updatedAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// POST /api/v1/conversations
export const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ error: "receiverId is required" });
    }

    // ✅ return existing conversation if already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      // populate before returning
      await conversation.populate("participants", "full_name profilepicture isOnline lastSeen email createdAt bio city phonenumber gender");
      
      const otherUser = conversation.participants.find(
        (p) => p._id.toString() !== senderId.toString()
      );

      return res.json({
        conversation: {
          _id: conversation._id,
          user: otherUser
            ? {
                _id: otherUser._id,
                full_name: otherUser.full_name,
                profilepicture: otherUser.profilepicture,
                isOnline: otherUser.isOnline || false,
                lastSeen: otherUser.lastSeen,
                email: otherUser.email,
                createdAt: otherUser.createdAt,
                bio: otherUser.bio,
                city: otherUser.city,
                phonenumber: otherUser.phonenumber,
                gender: otherUser.gender,
              }
            : null,
          lastMessage: null,
          unreadCount: {},
          isFavorite: conversation.isFavorite || false,
          updatedAt: conversation.updatedAt,
        }
      });
    }

    // ✅ create new conversation
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      unreadCount: {},
    });

    await conversation.populate("participants", "full_name profilepicture isOnline lastSeen email createdAt bio city phonenumber gender");

    const otherUser = conversation.participants.find(
      (p) => p._id.toString() !== senderId.toString()
    );

    res.status(201).json({
      conversation: {
        _id: conversation._id,
        user: otherUser
          ? {
              _id: otherUser._id,
              full_name: otherUser.full_name,
              profilepicture: otherUser.profilepicture,
              isOnline: otherUser.isOnline || false,
              lastSeen: otherUser.lastSeen,
              email: otherUser.email,
              createdAt: otherUser.createdAt,
              bio: otherUser.bio,
              city: otherUser.city,
              phonenumber: otherUser.phonenumber,
              gender: otherUser.gender,
            }
          : null,
        lastMessage: null,
        unreadCount: {},
        isFavorite: false,
        updatedAt: conversation.updatedAt,
      }
    });
  } catch (error) {
    console.error("createConversation error:", error);
    res.status(500).json({ error: error.message });
  }
};