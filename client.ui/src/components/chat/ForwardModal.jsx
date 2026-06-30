import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { getInitials, avatarColor } from "../../utils/chat";
import { useAuth } from "../../context/auth";
import api from "../../services/api";

const ForwardModal = ({ isOpen, onClose, onForward }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Auth] = useAuth();
  const loggedInUserId = Auth?.User?._id;

  useEffect(() => {
    if (isOpen && loggedInUserId) {
      setLoading(true);
      api.get(`/conversations/${loggedInUserId}`)
        .then((res) => setConversations(res.data))
        .catch((err) => console.error("Error fetching chats for forward:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, loggedInUserId]);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.user?.full_name || conv.user?.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Forward Message</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm dark:text-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No chats found</div>
          ) : (
            filteredConversations.map((conv) => {
              const [bg, fg] = avatarColor(conv.user?._id || "");
              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    onForward(conv._id);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: bg, color: fg }}
                  >
                    {getInitials(conv.user?.full_name || conv.user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {conv.user?.full_name || conv.user?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
