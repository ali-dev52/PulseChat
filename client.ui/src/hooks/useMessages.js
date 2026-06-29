import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { useSocket } from "./useSocket";
import { useAuth } from "../context/auth";

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(false);
  const socket = useSocket();
  const [Auth] = useAuth();
  const loggedInUserId = Auth?.User?._id;

  const convIdRef = useRef(conversationId);
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);
  console.log("useMessages socket:", socket?.id, "connected:", socket?.connected);
  // ── Fetch messages ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const controller = new AbortController();

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/messages/${conversationId}`, {
          signal: controller.signal,
        });
        setMessages(data.messages || data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("fetchMessages error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, [conversationId]);

  // ── Mark as seen when conversation opens ───────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    api.put(`/messages/seen/${conversationId}`).catch(() => { });
  }, [conversationId]);

  // ── Socket listeners — re-subscribe when socket changes ────────────────────
  useEffect(() => {
    if (!socket) return;

    console.log("✅ useMessages subscribing to socket");

    // ✅ new message — append to bubbles
    const handleNewMessage = (msg) => {
      console.log("💬 bubble newMessage:", msg.text, "conv:", msg.conversationId, "current:", convIdRef.current);
      if (String(msg.conversationId) !== String(convIdRef.current)) return;
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(msg._id));
        if (exists) return prev;
        return [...prev, msg];
      });
      // ✅ auto mark seen since conversation is open
      api.put(`/messages/seen/${msg.conversationId}`).catch(() => { });
    };

    // ✅ message status update — sent → delivered → seen
    const handleStatusUpdate = ({ messageId, status }) => {
      console.log("📊 status update:", messageId, "→", status);
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, status }
            : m
        )
      );
    };

    // ✅ all messages seen — turn all my ticks blue
    const handleMessagesSeen = ({ conversationId: convId }) => {
      console.log("👁 messagesSeen for conv:", convId, "current:", convIdRef.current);
      if (String(convId) !== String(convIdRef.current)) return;
      setMessages((prev) =>
        prev.map((m) => ({ ...m, status: "seen" }))
      );
    };

    // ✅ message deleted
    const handleDeleteMessage = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, isDeleted: true, text: "" }
            : m
        )
      );
    };

    // ✅ message edited
    const handleEditMessage = ({ messageId, text, editedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, text, editedAt }
            : m
        )
      );
    };

    // ✅ typing
    const handleTyping = ({ conversationId: convId }) => {
      if (String(convId) !== String(convIdRef.current)) return;
      setTypingUsers(true);
    };

    const handleStopTyping = ({ conversationId: convId }) => {
      if (String(convId) !== String(convIdRef.current)) return;
      setTypingUsers(false);
    };

    // ✅ message downloaded
    const handleMessageDownloaded = ({ messageId, downloadedBy }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (String(m._id) === String(messageId)) {
            const currentDownloadedBy = m.downloadedBy || [];
            if (!currentDownloadedBy.includes(downloadedBy)) {
              return { ...m, downloadedBy: [...currentDownloadedBy, downloadedBy] };
            }
          }
          return m;
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageStatusUpdated", handleStatusUpdate);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("messageDeleted", handleDeleteMessage);
    socket.on("messageEdited", handleEditMessage);
    socket.on("messageDownloaded", handleMessageDownloaded);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageStatusUpdated", handleStatusUpdate);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("messageDeleted", handleDeleteMessage);
      socket.off("messageEdited", handleEditMessage);
      socket.off("messageDownloaded", handleMessageDownloaded);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket]); // ✅ re-subscribe when socket reconnects

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text, replyTo = null, audioUrl = null, imageUrl = null) => {
      if ((!text.trim() && !audioUrl && !imageUrl) || !conversationId || sending) return;
      setSending(true);

      const optimisticId = `opt_${Date.now()}`;
      const optimistic = {
        _id: optimisticId,
        conversationId,
        sender: { _id: loggedInUserId },
        text,
        replyTo: replyTo || null,
        audioUrl: audioUrl || null,
        image: imageUrl || null,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const { data } = await api.post("/messages", {
          conversationId,
          text,
          replyTo: replyTo?._id || null,
          audioUrl: audioUrl || null,
          image: imageUrl || null,
        });

        const saved = data.message || data;
        setMessages((prev) =>
          prev.map((m) => {
            if (m._id !== optimisticId) return m;
            const keepStatus = m.status && m.status !== "sending" && m.status !== "failed";
            return {
              ...saved,
              status: keepStatus ? m.status : saved.status,
            };
          })
        );
      } catch (err) {
        console.error("sendMessage error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === optimisticId ? { ...m, status: "failed" } : m
          )
        );
      } finally {
        setSending(false);
      }
    },
    [conversationId, sending, loggedInUserId]
  );

  // ── Typing emitters ─────────────────────────────────────────────────────────
  const emitTyping = useCallback(
    (receiverId) => {
      if (!socket || !conversationId || !receiverId) return;
      socket.emit("typing", { conversationId, receiverId });
    },
    [socket, conversationId]
  );

  const emitStopTyping = useCallback(
    (receiverId) => {
      if (!socket || !conversationId || !receiverId) return;
      socket.emit("stopTyping", { conversationId, receiverId });
    },
    [socket, conversationId]
  );

  // ── Retry ───────────────────────────────────────────────────────────────────
  const retryMessage = useCallback(
    async (failedMsg) => {
      setMessages((prev) => prev.filter((m) => m._id !== failedMsg._id));
      await sendMessage(failedMsg.text, failedMsg.replyTo);
    },
    [sendMessage]
  );

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteMessage = useCallback(
    async (messageId) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, isDeleted: true, text: "" }
            : m
        )
      );
      try {
        await api.delete(`/messages/${messageId}`);
      } catch (err) {
        console.error("deleteMessage error:", err);
        const { data } = await api.get(`/messages/${conversationId}`);
        setMessages(data.messages || data);
      }
    },
    [conversationId]
  );

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const editMessage = useCallback(
    async (messageId, newText) => {
      if (!newText.trim()) return;

      const originalMessages = messages;
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, text: newText.trim(), editedAt: new Date().toISOString() }
            : m
        )
      );

      try {
        await api.put(`/messages/${messageId}/edit`, { text: newText });
      } catch (err) {
        console.error("editMessage error:", err);
        setMessages(originalMessages);
      }
    },
    [messages]
  );

  // ── Send Pulse ───────────────────────────────────────────────────────────────
  const sendPulse = useCallback(async () => {
    if (!conversationId) return;
    try {
      await api.post("/messages/pulse", { conversationId });
    } catch (err) {
      console.error("sendPulse error:", err);
    }
  }, [conversationId]);

  // ── Mark as Downloaded ───────────────────────────────────────────────────────
  const markAsDownloaded = useCallback(async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/downloaded`);
      setMessages((prev) =>
        prev.map((m) => {
          if (String(m._id) === String(messageId)) {
            const currentDownloadedBy = m.downloadedBy || [];
            if (!currentDownloadedBy.includes(loggedInUserId)) {
              return { ...m, downloadedBy: [...currentDownloadedBy, loggedInUserId] };
            }
          }
          return m;
        })
      );
    } catch (err) {
      console.error("markAsDownloaded error:", err);
    }
  }, [loggedInUserId]);

  return {
    messages,
    loading,
    sending,
    typingUsers,
    sendMessage,
    emitTyping,
    emitStopTyping,
    retryMessage,
    deleteMessage,
    editMessage,
    sendPulse,
    markAsDownloaded,
  };
};