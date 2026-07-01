import User from "../models/user.models.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Basic monthly registration data for charting
    const last6Months = new Date();
    last6Months.setMonth(last6Months.getMonth() - 6);
    
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: last6Months } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        conversations: totalConversations,
        messages: totalMessages,
      },
      chartData: {
        users: userRegistrations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isblocked, isadmin, issuperadmin } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Role change restrictions
    if (isadmin !== undefined || issuperadmin !== undefined) {
      if (!req.user.issuperadmin) {
        return res.status(403).json({ success: false, message: "Only Super Admins can change roles" });
      }
      
      if (targetUser.issuperadmin) {
        return res.status(403).json({ success: false, message: "Super Admin roles cannot be changed" });
      }
    }

    if (isblocked !== undefined) targetUser.isblocked = isblocked;
    if (isadmin !== undefined) targetUser.isadmin = isadmin;
    if (issuperadmin !== undefined) targetUser.issuperadmin = issuperadmin;

    await targetUser.save();
    res.status(200).json({ success: true, message: "User status updated successfully", user: targetUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("participants", "full_name email profilepicture")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversationId: id })
      .populate("sender", "full_name email profilepicture")
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });
    res.status(200).json({ success: true, message: "Conversation and all messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
