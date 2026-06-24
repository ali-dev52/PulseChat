import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import Sidebar from "../components/sidebar/Sidebar";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import NewChatModal from "../components/newChat/NewChatModal";
import api from "../services/api";
import { useChat } from "../hooks/useChat";

const Chatpage = ({ toggleDark }) => {
  const [Auth] = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Chats");

  // single source of truth — useChat only here
  const { conversations, loading, refetch, resetUnread } = useChat(selectedChat?._id);

  const handleSelectChat = (conv) => {
    setSelectedChat(conv);
    resetUnread(conv._id); // reset unread badge immediately
  };

  useEffect(() => {
    if (!selectedUser) return;

    const createAndOpen = async () => {
      try {
        const { data } = await api.post("/conversations", {
          receiverId: selectedUser._id,
        });

        const conv = data.conversation;
        if (!conv) return;

        await refetch(); // reload sidebar

        handleSelectChat({
          _id: conv._id,
          user: {
            _id: selectedUser._id,
            name: selectedUser.full_name || "Unknown",
            email: selectedUser.email,
            avatar: selectedUser.profilepicture,
            isOnline: selectedUser.isOnline || false,
            lastSeen: selectedUser.lastSeen || null,
          },
          lastMessage: conv.lastMessage || null,
          unread: 0,
          isFavorite: conv.isFavorite || false,
        });

      } catch (err) {
        console.error("createConversation error:", err);
      } finally {
        setSelectedUser(null);
        setShowNewChat(false);
      }
    };

    createAndOpen();
  }, [selectedUser]);

  const handleUserStatusChange = (userId, isOnline, lastSeen) => {
    setSelectedChat((prev) => {
      if (!prev || String(prev.user?._id) !== String(userId)) return prev;
      return {
        ...prev,
        user: { ...prev.user, isOnline, lastSeen: lastSeen || prev.user.lastSeen },
      };
    });
  };

  if (!Auth.isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shadow-neon" />
      </div>
    );
  }

  if (!Auth.User) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-primary-500/30 transition-colors duration-500">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        toggleDark={toggleDark}
      />

      {activeTab === 'Chats' ? (
        <>
          <div className={`flex h-full flex-1 md:flex-none md:w-auto shrink-0 z-20 transition-transform ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <ChatList
              conversations={conversations}
              loading={loading}
              refetch={refetch}
              setSelectedChat={handleSelectChat}
              selectedChatId={selectedChat?._id}
              openNewChat={() => setShowNewChat(true)}
            />
          </div>
          <div className={`flex-1 h-full min-w-0 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <ChatWindow
              conversation={selectedChat}
              onUserStatusChange={handleUserStatusChange}
              onBack={() => setSelectedChat(null)}
            />
          </div>
        </>
      ) : null}

      {showNewChat && (
        <NewChatModal
          onSelectUser={setSelectedUser}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
};

export default Chatpage;