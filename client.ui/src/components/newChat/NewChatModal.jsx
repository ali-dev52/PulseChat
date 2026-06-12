import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { getInitials, avatarColor } from "../../utils/chat";
import { useAuth } from "../../context/auth";
import { X, Search as SearchIcon, ChevronRight, UserX } from "lucide-react";
import ModalWrapper from "../shared/ModalWrapper";

const NewChatModal = ({ onSelectUser, onClose }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const [Auth] = useAuth();
  const loggedInUserId = Auth?.User?._id;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/users", {
          params: { q: search },
          signal: controller.signal,
        });
        // filter out logged in user
        const filtered = (data.users || data).filter(
          (u) => String(u._id) !== String(loggedInUserId)
        );
        setUsers(filtered);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("Failed to load users. Try again.");
          console.error("NewChatModal fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [search, loggedInUserId]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <ModalWrapper onClose={onClose}>
      <div className="rounded-2xl w-80 md:w-96 overflow-hidden shadow-2xl backdrop-blur-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors duration-500">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b backdrop-blur-md border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <span className="font-medium text-sm text-slate-900 dark:text-white">
            New Chat
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b backdrop-blur-md border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 w-4 h-4 pointer-events-none text-slate-400 dark:text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full text-sm outline-none border transition-all backdrop-blur-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border-transparent dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>
        </div>

        {/* User list */}
        <div className="max-h-72 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
                  <div className="w-9 h-9 rounded-full animate-pulse flex-shrink-0 bg-slate-200 dark:bg-slate-800" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 w-28 rounded animate-pulse bg-slate-200 dark:bg-slate-800" />
                    <div className="h-2.5 w-36 rounded animate-pulse bg-slate-100 dark:bg-slate-800/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={() => setSearch((s) => s + " ")}
                className="text-xs transition-colors text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500 dark:text-slate-400">
              <UserX className="w-8 h-8 opacity-50" />
              <p className="text-sm font-medium">
                {search ? "No users found" : "No users available"}
              </p>
            </div>
          ) : (
            users.map((user) => {
              const [bg, fg] = avatarColor(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                >
                  <div
                    className="relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{ background: bg, color: fg }}
                  >
                    {getInitials(user.full_name)}
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {user.full_name}
                    </p>
                    <p className="text-xs truncate text-slate-500 dark:text-slate-400">
                      {user.isOnline
                        ? <span className="text-green-600 dark:text-green-400">online</span>
                        : user.email
                      }
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default NewChatModal;