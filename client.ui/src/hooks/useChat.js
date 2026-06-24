import { useEffect, useState, useCallback, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/auth";
import { useSocket } from "./useSocket";
import { toast } from "react-toastify";

export const useChat = (selectedChatId = null) => { // ✅ accepts selectedChatId
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Auth] = useAuth();
  const socket = useSocket();
  const loggedInUserId = Auth?.User?._id;

  const loggedInUserIdRef = useRef(loggedInUserId);
  const selectedChatIdRef = useRef(selectedChatId); // ✅ ref for socket handler

  useEffect(() => {
    loggedInUserIdRef.current = loggedInUserId;
  }, [loggedInUserId]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId; // ✅ always fresh in socket handler
    
    // Auto-close desktop notifications for this chat when we open it
    if (selectedChatId && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.getNotifications({ tag: selectedChatId }).then((notifications) => {
          notifications.forEach((n) => n.close());
        });
      });
    }
  }, [selectedChatId]);

  const fetchConversations = useCallback(async () => {
    if (!loggedInUserId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/conversations/${loggedInUserId}`);

      const formatted = data.map((conv) => {
        const lastMsg = conv.lastMessage || null;
        const isMyLastMsg = String(lastMsg?.sender?._id) === String(loggedInUserId);
        const unread = lastMsg && !isMyLastMsg
          ? conv.unreadCount?.[loggedInUserId] || 0
          : 0;

        return {
          ...conv,
          user: {
            _id: conv.user?._id,
            name: conv.user?.full_name || "Unknown",
            full_name: conv.user?.full_name || "Unknown",
            isOnline: conv.user?.isOnline || false,
            avatar: conv.user?.profilepicture || null,
            lastSeen: conv.user?.lastSeen || null,
            email: conv.user?.email,
            createdAt: conv.user?.createdAt,
            bio: conv.user?.bio,
            city: conv.user?.city,
            phonenumber: conv.user?.phonenumber,
            gender: conv.user?.gender,
          },
          unread,
        };
      });

      formatted.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : 0;
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : 0;
        return bTime - aTime;
      });

      setConversations(formatted);
    } catch (error) {
      console.error("fetchConversations error:", error);
    } finally {
      setLoading(false);
    }
  }, [loggedInUserId]);

  useEffect(() => {
    if (loggedInUserId) {
      fetchConversations();
      // Ask user for permission to send desktop notifications
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [loggedInUserId, fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setConversations((prev) => {
        const isFromOther = String(msg.sender?._id) !== String(loggedInUserIdRef.current);
        const isCurrentlyOpen = String(msg.conversationId) === String(selectedChatIdRef.current);

        if (isFromOther && !isCurrentlyOpen) {
          const conv = prev.find((c) => String(c._id) === String(msg.conversationId));
          const senderName = conv?.user?.full_name || conv?.user?.name || "Someone";

          // Play notification sound
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
          } catch (e) {
            console.log("Audio play failed:", e);
          }

          // 1. Always show an in-app popup (if user is looking at another page/chat)
          toast.info(`New message from ${senderName}: ${msg.text}`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });

          // (Native notifications are now entirely handled by service-worker.js via Web Push)
        }

        return prev
          .map((conv) => {
            if (String(conv._id) !== String(msg.conversationId)) return conv;
            return {
              ...conv,
              lastMessage: {
                _id: msg._id,
                text: msg.text,
                sender: msg.sender,
                status: msg.status,
                createdAt: msg.createdAt,
                isDeleted: msg.isDeleted,
              },
              unread: isFromOther && !isCurrentlyOpen
                ? (conv.unread || 0) + 1
                : conv.unread,
            };
          })
          .sort((a, b) => {
            const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : 0;
            const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : 0;
            return bTime - aTime;
          });
      });
    };

    const handleConversationUpdated = (msg) => {
      const lastMessage = msg.lastMessage || {
        _id: msg._id,
        text: msg.text,
        sender: msg.sender,
        status: msg.status,
        createdAt: msg.createdAt,
        isDeleted: msg.isDeleted,
      };

      setConversations((prev) =>
        prev
          .map((conv) => {
            if (String(conv._id) !== String(msg.conversationId)) return conv;
            return {
              ...conv,
              lastMessage,
            };
          })
          .sort((a, b) => {
            const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : 0;
            const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : 0;
            return bTime - aTime;
          })
      );
    };

    const handleMessagesSeen = ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          String(conv._id) === String(conversationId)
            ? { ...conv, unread: 0 }
            : conv
        )
      );
    };

    const handleOnlineStatus = ({ userId, isOnline, lastSeen }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          String(conv.user?._id) === String(userId)
            ? { ...conv, user: { ...conv.user, isOnline, lastSeen: lastSeen || conv.user.lastSeen } }
            : conv
        )
      );
    };

    const handleStatusUpdate = ({ messageId, status }) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.lastMessage && String(conv.lastMessage._id) === String(messageId)) {
            return { ...conv, lastMessage: { ...conv.lastMessage, status } };
          }
          return conv;
        })
      );
    };

    const handleMessageDeleted = ({ messageId, conversationId }) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (String(conv._id) === String(conversationId) && conv.lastMessage && String(conv.lastMessage._id) === String(messageId)) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                isDeleted: true,
                text: ""
              }
            };
          }
          return conv;
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("conversationUpdated", handleConversationUpdated);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("userStatusChanged", handleOnlineStatus);
    socket.on("messageStatusUpdated", handleStatusUpdate);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationUpdated", handleConversationUpdated);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("userStatusChanged", handleOnlineStatus);
      socket.off("messageStatusUpdated", handleStatusUpdate);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket]);

  const resetUnread = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        String(conv._id) === String(conversationId)
          ? { ...conv, unread: 0 }
          : conv
      )
    );
  }, []);

  return {
    conversations,
    loading,
    refetch: fetchConversations,
    resetUnread,
  };
};