import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useMessages } from "../../hooks/useMessages";
import { useSocket } from "../../hooks/useSocket";
import {
  getInitials,
  avatarColor,
  formatBubbleTime,
  formatTime,
  groupMessagesByDate,
} from "../../utils/chat";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, MoreVertical, Paperclip, Smile, Send, Edit2, Trash2, Reply, Check, CheckCheck, AlertCircle, CornerDownRight, X, Phone, Video, Mic, Square, Trash, Image, Download, CornerUpRight, ShieldBan } from "lucide-react";
import ForwardModal from "./ForwardModal";
import AnimatedReveal from "../shared/AnimatedReveal";
import VoicePlayer from "./VoicePlayer";
import api from "../../services/api";
import { successtoast, errortoast } from "../../toastify/toastify";

const MessageStatus = ({ status }) => {
  if (status === "sending") return <Check className="w-3 h-3 text-slate-400 dark:text-slate-500" />;
  if (status === "sent") return <Check className="w-3 h-3 text-slate-600 dark:text-slate-400" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-600 dark:text-slate-400" />;
  if (status === "seen") return <CheckCheck className="w-3 h-3 text-primary-500" />;
  if (status === "failed") return <AlertCircle className="w-3 h-3 text-red-500" />;
  return null;
};

const ReplyPreview = ({ msg, onCancel, loggedInUserId }) => {
  const isMe = String(msg.sender?._id || msg.sender) === String(loggedInUserId);
  return (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center gap-3 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-l-4 border-primary-500 mx-4 mb-2 rounded-xl shadow-lg border border-white/5"
  >
    <div className="flex-1 min-w-0">
      <p className="text-xs text-primary-400 font-medium mb-0.5">
        Replying to {isMe ? "You" : (msg.sender?.full_name || msg.sender?.name || "Someone")}
      </p>
      <p className="text-xs text-gray-300 truncate">{msg.text}</p>
    </div>
    <button
      onClick={onCancel}
      className="text-gray-400 hover:text-white text-sm flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
    >
      ✕
    </button>
  </motion.div>
  );
};

const ChatWindow = ({ conversation, onUserStatusChange, onBack }) => {
  const [Auth, setAuth] = useAuth();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [pulseMessage, setPulseMessage] = useState("");
  const [forwardMessageId, setForwardMessageId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showRestoreNotice, setShowRestoreNotice] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioTimerRef = useRef(null);
  const loggedInUserId = Auth?.User?._id;
  const socket = useSocket();
  const navigate = useNavigate();

  const {
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
    reportScreenshotAttempt,
    forwardMessage,
    refreshMessages,
  } = useMessages(conversation?._id);

  // Anti-Screenshot and Blur Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      // PrintScreen, Cmd+Shift+S, Cmd+Shift+4, Ctrl+P, Cmd+P
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S" || e.key === "4")) ||
        (e.ctrlKey && (e.key === "p" || e.key === "P")) ||
        (e.metaKey && (e.key === "p" || e.key === "P"))
      ) {
        // Attempt to block and clear clipboard
        navigator.clipboard.writeText("");
        reportScreenshotAttempt();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        reportScreenshotAttempt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [reportScreenshotAttempt]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // focus input
  useEffect(() => {
    if (conversation) inputRef.current?.focus();
    setReplyTo(null); // clear reply when switching conversation
  }, [conversation?._id]);

  // listen for online status to update header
  useEffect(() => {
    if (!socket || !onUserStatusChange) return;
    const handle = ({ userId, isOnline, lastSeen }) => {
      onUserStatusChange(userId, isOnline, lastSeen);
    };
    socket.on("userStatusChanged", handle);
    return () => socket.off("userStatusChanged", handle);
  }, [socket, onUserStatusChange]);

  // listen for pulse
  useEffect(() => {
    if (!socket || !conversation) return;
    const handlePulse = ({ conversationId, senderId }) => {
      if (String(conversationId) !== String(conversation._id)) return;
      if (String(senderId) !== String(conversation.user?._id)) return;
      
      setPulseMessage("⚡ Pulse received!");
      setPulseActive(true);
      
      setTimeout(() => {
        setPulseActive(false);
        setTimeout(() => setPulseMessage(""), 500);
      }, 1500);
    };

    socket.on("receivePulse", handlePulse);
    return () => socket.off("receivePulse", handlePulse);
  }, [socket, conversation]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 text-gray-500 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[20%] left-[30%] w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[30%] w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] border border-red-500/30 backdrop-blur-xl mb-2"
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-6xl drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
            >
              🫀
            </motion.span>
          </motion.div>
          <h3 className="text-3xl font-bold drop-shadow-md tracking-wider">
            <span className="text-red-500">Pulse</span>
            <span className="text-blue-500">Chat</span>
          </h3>
          <p className="text-sm">Select a chat or start a new conversation</p>
        </motion.div>
      </div>
    );
  }

  const otherUser = conversation.user;
  const [bg, fg] = avatarColor(otherUser?._id || "");
  const grouped = groupMessagesByDate(messages);

  const isBlocked = Auth?.User?.blockedUsers?.some(u => String(u._id || u) === String(otherUser?._id));

  const handleToggleBlock = async () => {
    try {
      const { data } = await api.post(`/auth/block/${otherUser?._id}`);
      if (data.success) {
        const nextBlocked = !isBlocked;
        const userName = otherUser?.full_name || otherUser?.name || "this user";
        const message = nextBlocked
          ? `You blocked ${userName}. Messages are now paused until you unblock them.`
          : `You unblocked ${userName}. The conversation is restored and ready for messaging.`;
        successtoast(message);

        const updatedBlocked = nextBlocked
          ? [...(Auth.User.blockedUsers || []), otherUser?._id]
          : Auth.User.blockedUsers.filter(u => String(u._id || u) !== String(otherUser?._id));

        setAuth({
          ...Auth,
          User: { ...Auth.User, blockedUsers: updatedBlocked }
        });

        if (!nextBlocked) {
          setShowRestoreNotice(true);
          await refreshMessages();
        }
      }
    } catch (err) {
      const userName = otherUser?.full_name || otherUser?.name || "this user";
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
      errortoast(backendMessage || `Unable to update block status for ${userName}.`);
    }
  };

  const handleRestoreConversation = async () => {
    await refreshMessages();
    setShowRestoreNotice(false);
    const userName = otherUser?.full_name || otherUser?.name || "this contact";
    successtoast(`Conversation with ${userName} refreshed and ready to continue.`);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!otherUser?._id) return;
    emitTyping(otherUser._id);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitStopTyping(otherUser._id);
    }, 1500);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      audioTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to send voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(audioTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(audioTimerRef.current);
    setAudioBlob(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
  };

  const uploadAudioBlob = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          const { data } = await api.post("/messages/upload-audio", { audio: base64Audio });
          resolve(data.Location);
        } catch (error) {
          reject(error);
        }
      };
    });
  };

  const handleDownload = async (msg, type) => {
    try {
      const url = type === 'image' ? msg.image : msg.audioUrl;
      const proxyUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/messages/stream-audio?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `PulseChat_${type}_${Date.now()}.${type === 'image' ? 'png' : 'webm'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      
      // Mark as downloaded if I am not the sender
      if (String(msg.sender?._id || msg.sender) !== String(loggedInUserId)) {
        await markAsDownloaded(msg._id);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreviewUrl(reader.result);
      setImageBase64(reader.result);
    };
    e.target.value = null; // reset input
  };

  const cancelImage = () => {
    setImagePreviewUrl(null);
    setImageBase64(null);
  };

  const formatRecordingTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSend = async () => {
    if (isBlocked) {
      errortoast("You are blocked now. Unblock this user to continue chatting.");
      return;
    }

    if ((!text.trim() && !audioBlob && !imageBase64) || sending || uploadingAudio || uploadingImage) return;
    
    let audioUrl = null;
    let imageUrl = null;

    if (audioBlob) {
      setUploadingAudio(true);
      try {
        audioUrl = await uploadAudioBlob(audioBlob);
      } catch (err) {
        console.error("Audio upload failed", err);
        setUploadingAudio(false);
        return;
      }
      setUploadingAudio(false);
    }

    if (imageBase64) {
      setUploadingImage(true);
      try {
        const { data } = await api.post("/messages/upload-image", { image: imageBase64 });
        imageUrl = data.Location;
      } catch (err) {
        console.error("Image upload failed", err);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    const msg = text.trim();
    const reply = replyTo;
    setText("");
    setReplyTo(null);
    setAudioBlob(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setImageBase64(null);
    setImagePreviewUrl(null);
    emitStopTyping(otherUser?._id);
    await sendMessage(msg, reply, audioUrl, imageUrl);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
      <motion.div 
        animate={pulseActive ? {
          scale: [1, 1.03, 0.98, 1.02, 0.99, 1],
          boxShadow: [
            "0px 0px 0px rgba(239, 68, 68, 0)",
            "0px 0px 60px rgba(239, 68, 68, 0.8)",
            "0px 0px 20px rgba(239, 68, 68, 0.4)",
            "0px 0px 80px rgba(239, 68, 68, 0.9)",
            "0px 0px 0px rgba(239, 68, 68, 0)"
          ]
        } : {}}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`flex-1 h-full flex flex-col min-h-0 min-w-0 relative bg-white dark:bg-slate-950 transition-colors duration-500 select-none ${pulseActive ? "ring-4 ring-red-500/50" : ""}`}
        onContextMenu={(e) => e.preventDefault()}
      >

        <AnimatePresence>
          {pulseMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
              className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
            >
              <div className="bg-red-500/90 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-[0_0_40px_rgba(239,68,68,0.8)] backdrop-blur-md flex items-center gap-4 border border-red-400">
                <span className="text-4xl animate-pulse">🫀</span>
                {pulseMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
      <div className="h-20 flex items-center gap-3 px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10 shadow-sm transition-colors duration-500">
        {onBack && (
          <button onClick={onBack} className="md:hidden transition-colors mr-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div
          onClick={() => navigate("/profile", { state: { user: otherUser } })}
          className="relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: bg, color: fg }}
        >
          {getInitials(otherUser?.full_name || otherUser?.name)}
          {otherUser?.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
          )}
        </div>

        <div 
          onClick={() => navigate("/profile", { state: { user: otherUser } })}
          className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="text-base font-medium truncate tracking-wide text-slate-900 dark:text-white">
            {otherUser?.full_name || otherUser?.name || "Unknown"}
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {typingUsers ? (
              <span className="text-blue-500 animate-pulse">typing...</span>
            ) : otherUser?.isOnline ? (
              <span className="text-green-600 dark:text-green-500">Online</span>
            ) : otherUser?.lastSeen ? (
              <span>Last seen {formatTime(otherUser.lastSeen)}</span>
            ) : (
              <span>Last seen recently</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Go to dashboard"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={handleToggleBlock}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isBlocked ? "Unblock User" : "Block User"}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isBlocked ? 'text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <ShieldBan className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Search"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="More"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {isBlocked && (
        <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 flex items-center justify-between gap-3 shadow-sm">
          <span>You blocked this user. They cannot send messages until you unblock them.</span>
          <button onClick={handleToggleBlock} className="font-semibold underline-offset-2 hover:underline">Unblock</button>
        </div>
      )}

      {showRestoreNotice && !isBlocked && (
        <div className="mx-4 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 flex items-center justify-between gap-3 shadow-sm">
          <span>Conversation restored. Refresh it anytime to view the latest messages.</span>
          <button onClick={handleRestoreConversation} className="font-semibold underline-offset-2 hover:underline">Restore</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 flex flex-col gap-2 custom-scrollbar bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {loading ? (
          <div className="flex flex-col gap-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div
                  className="h-12 rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800"
                  style={{ width: `${140 + (i * 37) % 100}px` }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-slate-500 dark:text-slate-400">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-slate-100 dark:bg-slate-800">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          grouped.map(({ label, messages: group }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex items-center justify-center my-4 sticky top-0 z-10">
                <span className="text-[11px] font-medium text-gray-300 bg-slate-800/90 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full shadow-sm">
                  {label}
                </span>
              </div>

              {group.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg._id}
                      className="flex justify-center my-2"
                    >
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 px-4 py-1.5 rounded-full shadow-sm">
                        {msg.text}
                      </span>
                    </motion.div>
                  );
                }

                const isMe =
                  String(msg.sender?._id || msg.sender) === String(loggedInUserId);
                
                const isOnlyImage = msg.image && !msg.text && !msg.audioUrl;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} group mb-1`}
                  >
                    <div className="flex flex-col max-w-[70%]">

                      {/* reply preview inside bubble */}
                      {msg.replyTo && (
                        <div className={`text-xs px-3 py-2 rounded-lg mb-1 border-l-4 border-primary-400/50 backdrop-blur-sm ${
                          isMe ? "bg-primary-900/30 text-gray-200" : "bg-slate-700/50 text-gray-200"
                        }`}>
                          <p className="text-primary-300 font-medium text-[10px] mb-0.5 tracking-wide flex items-center gap-1">
                            <Reply className="w-3 h-3 opacity-80" />
                            {String(msg.replyTo.sender?._id || msg.replyTo.sender) === String(loggedInUserId) 
                              ? "You" 
                              : (msg.replyTo.sender?.full_name || "Someone")}
                          </p>
                          {msg.replyTo.image ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Image className="w-4 h-4 opacity-70" />
                              <span className="opacity-90 italic text-[11px]">Photo</span>
                            </div>
                          ) : msg.replyTo.audioUrl ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Mic className="w-4 h-4 opacity-70" />
                              <span className="opacity-90 italic text-[11px]">Voice Note</span>
                            </div>
                          ) : (
                            <p className="truncate opacity-90">{msg.replyTo.text}</p>
                          )}
                        </div>
                      )}

                      <div className={`relative ${isOnlyImage ? 'p-1 rounded-2xl bg-transparent' : 'px-4 py-2.5 rounded-2xl shadow-sm'} text-[15px] leading-relaxed ${
                        isMe
                          ? (isOnlyImage ? "" : "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm")
                          : (isOnlyImage ? "" : "bg-surface border border-white/5 text-gray-100 rounded-tl-sm")
                      } ${msg.status === "sending" ? "opacity-70" : "opacity-100"}`}>

                        {/* Action Bar on hover */}
                        {!msg.isDeleted && (
                          <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'right-full mr-3' : 'left-full ml-3'} opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-1 z-10 scale-95 group-hover:scale-100`}>
                            {isMe && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(msg._id);
                                    setEditText(msg.text);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-green-500 dark:text-slate-400 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingId(msg._id)}
                                  className="p-1.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setReplyTo(msg)}
                              className="p-1.5 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                              title="Reply"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setForwardMessageId(msg._id)}
                              className="p-1.5 text-slate-500 hover:text-purple-500 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                              title="Forward"
                            >
                              <CornerUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {msg.isDeleted ? (
                          <p className="break-words italic opacity-70 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> This message was deleted
                          </p>
                        ) : (
                          <>
                            {msg.image && (
                              <div className={`${msg.text || msg.audioUrl ? 'mb-2' : 'mb-0'} max-w-[250px] sm:max-w-[300px] relative group`}>
                                <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-white/10 shadow-sm relative">
                                  <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/messages/stream-audio?url=${encodeURIComponent(msg.image)}`} alt="Attachment" className="w-full" />
                                </div>
                                <button
                                  onClick={() => handleDownload(msg, 'image')}
                                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Download Image"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {msg.audioUrl && (
                               <div className={`${msg.text ? 'mb-2' : 'mb-0'} min-w-[200px] sm:min-w-[250px] relative group`}>
                                 <VoicePlayer src={msg.audioUrl} isMe={isMe} />
                                 <button
                                   onClick={() => handleDownload(msg, 'audio')}
                                   className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'left-0 -translate-x-[120%]' : 'right-0 translate-x-[120%]'} p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                                   title="Download Audio"
                                 >
                                   <Download className="w-4 h-4" />
                                 </button>
                               </div>
                            )}
                            {msg.text && <p className="break-words">{msg.text}</p>}
                          </>
                        )}

                        <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
                          isMe ? "text-primary-100/70" : "text-gray-500"
                        }`}>
                          <span className="text-[10px] font-medium">
                            {formatBubbleTime(msg.createdAt)}
                            {msg.editedAt && <span className="ml-1 opacity-70">(edited)</span>}
                          </span>
                          {isMe && <MessageStatus status={msg.status} />}
                          {isMe && msg.downloadedBy && msg.downloadedBy.length > 0 && (msg.image || msg.audioUrl) && (
                            <span className="text-[9px] font-medium flex items-center gap-0.5 ml-1 text-green-300 bg-black/10 px-1 rounded">
                              <CheckCheck className="w-2.5 h-2.5" /> Saved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Forwarded Indicators below message */}
                      {msg.isForwarded ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 italic ml-1">
                          <CornerUpRight className="w-3 h-3" />
                          <span>Forwarded</span>
                        </div>
                      ) : (
                        msg.forwardCount > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-purple-500 dark:text-purple-400 mt-0.5 italic ml-1">
                            <CornerUpRight className="w-3 h-3" />
                            <span>Forwarded {msg.forwardCount} time{msg.forwardCount > 1 ? 's' : ''}</span>
                          </div>
                        )
                      )}

                      {/* failed message retry */}
                      {msg.status === "failed" && (
                        <button
                          onClick={() => retryMessage(msg)}
                          className="text-[11px] text-red-400 hover:text-red-300 mt-1 self-end font-medium transition-colors"
                        >
                          Tap to retry
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}

        {/* typing indicator bubble */}
        {typingUsers && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start mt-2"
          >
            <div className="bg-surface border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1.5 items-center h-2">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      <AnimatePresence>
        {replyTo && (
          <ReplyPreview msg={replyTo} onCancel={() => setReplyTo(null)} loggedInUserId={loggedInUserId} />
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="sticky bottom-0 p-4 border-t flex-shrink-0 z-20 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 backdrop-blur-xl transition-colors duration-500">
        <div className="flex flex-wrap items-end gap-3 max-w-5xl mx-auto relative">
          
          <motion.button
            onClick={() => {
              sendPulse();
              setPulseMessage("Pulse Sent!");
              setTimeout(() => setPulseMessage(""), 1000);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Send Pulse"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 shadow-sm border border-red-500/20"
          >
            <span className="text-xl">🫀</span>
          </motion.button>
          
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-4 right-14 bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl p-3 w-72 grid grid-cols-5 gap-2 z-50"
              >
                {["😀","😂","🥰","😎","😢","👍","❤️","🔥","🎉","✨","🤔","🙌","👏","🙏","😊","😍","😁","🙄","😜","😘"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                      inputRef.current?.focus();
                    }}
                    className="text-2xl hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-xl transition-colors flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0 border border-slate-200 dark:border-slate-700 rounded-3xl relative flex items-center overflow-hidden transition-all focus-within:border-primary-500/50 bg-slate-50 dark:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-sm focus-within:shadow-md h-[52px]">
            {isRecording ? (
              <div className="w-full h-full flex items-center justify-between px-3 sm:px-5 bg-red-50 dark:bg-red-500/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 z-10" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 absolute animate-ping opacity-75" />
                  </div>
                  <span className="text-red-500 font-medium tracking-wider text-xs sm:text-base w-10 sm:w-12">{formatRecordingTime(recordingTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={cancelRecording} 
                    className="flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={stopRecording} 
                    className="flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-500/20 rounded-full transition-colors sm:ml-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : audioPreviewUrl ? (
              <div className="w-full h-full flex items-center justify-between px-2 sm:px-4 bg-slate-100 dark:bg-slate-700/50">
                <div className="flex-1 flex items-center">
                  <VoicePlayer src={audioPreviewUrl} isMe={false} />
                </div>
                <button 
                  onClick={cancelRecording} 
                  className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors flex-shrink-0"
                  title="Delete Recording"
                >
                  <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : imagePreviewUrl ? (
              <div className="w-full h-full flex items-center justify-between px-2 sm:px-4 bg-slate-100 dark:bg-slate-700/50">
                <div className="flex-1 flex items-center py-1">
                  <img src={imagePreviewUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md shadow-sm border border-slate-300 dark:border-slate-600" />
                  <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-300">Image attached</span>
                </div>
                <button 
                  onClick={cancelImage} 
                  className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors flex-shrink-0"
                  title="Remove Image"
                >
                  <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isBlocked}
                  placeholder={replyTo ? "Type a reply..." : isBlocked ? "Messaging is paused while this user is blocked" : "Type a message..."}
                  className="w-full h-full py-3.5 px-6 pr-24 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-[15px] outline-none disabled:cursor-not-allowed"
                />
                <label title="Attach Image" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer absolute right-12 z-10">
                  <Paperclip className="w-5 h-5" />
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
                <motion.button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors absolute right-2 ${showEmojiPicker ? "text-primary-500 bg-primary-50 dark:bg-primary-500/10" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  <Smile className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>

          {(!text.trim() && !isRecording && !audioBlob && !imageBase64) ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              title="Record Voice Note"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex-shrink-0 shadow-sm"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={(!text.trim() && !audioBlob && !imageBase64) || sending || uploadingAudio || uploadingImage}
              title="Send"
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 shadow-lg ${uploadingAudio || uploadingImage ? 'bg-primary-400 animate-pulse' : 'bg-primary-500 hover:bg-primary-600'} disabled:opacity-40 disabled:cursor-not-allowed shadow-primary-500/30`}
            >
              {uploadingAudio || uploadingImage ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5 translate-x-0.5" />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Edit Message Modal */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setEditingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-96 shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-lg mb-4">Edit Message</h3>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 bg-slate-800 text-white border border-white/20 rounded-lg outline-none focus:border-white/40 resize-none text-sm"
                rows="4"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await editMessage(editingId, editText);
                    setEditingId(null);
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Message Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-80 shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-lg mb-2">Delete Message?</h3>
              <p className="text-gray-400 text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteMessage(deletingId);
                    setDeletingId(null);
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other User Profile Modal */}
      {showProfile && (
        <ProfileModal 
          user={otherUser} 
          onClose={() => setShowProfile(false)} 
        />
        )}

      <ForwardModal 
        isOpen={!!forwardMessageId}
        onClose={() => setForwardMessageId(null)}
        onForward={(targetConversationId) => {
          forwardMessage(forwardMessageId, targetConversationId);
        }}
      />
      </motion.div>
  );
};

export default ChatWindow;