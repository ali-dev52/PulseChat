import { useState } from "react";
import ChatItem from "./ChatItem";
import SearchBar from "../search/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, MessageSquareDashed } from "lucide-react";

const ChatList = ({
  conversations = [],
  loading,
  refetch,
  setSelectedChat,
  selectedChatId,
  openNewChat,
}) => {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((conv) =>
    conv.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-[340px] md:flex-none h-full min-w-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 transition-colors duration-500">

      {/* Header */}
      <div className="flex items-center justify-between  px-4 md:px-6 h-20 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] flex-shrink-0"
          >
            🫀
          </motion.div>
          <span className="font-bold text-xl tracking-wide drop-shadow-sm min-w-0 truncate">
            <span className="text-red-500">Pulse</span>
            <span className="text-blue-500">Chat</span>
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={refetch}
            title="Refresh"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openNewChat}
            title="New chat"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 min-w-0">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-0"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex justify-between min-w-0">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-3 w-10 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse flex-shrink-0" />
                    </div>
                    <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/70 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 dark:text-slate-400"
            >
              <MessageSquareDashed className="w-10 h-10 opacity-50" />
              <p className="text-sm font-medium">
                {search ? "No results found" : "No conversations yet"}
              </p>
              {!search && (
                <button
                  onClick={openNewChat}
                  className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  Start a new chat
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map((conv, i) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="min-w-0"
              >
                <ChatItem
                  conv={conv}
                  isActive={conv._id === selectedChatId}
                  onClick={() => setSelectedChat(conv)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatList;