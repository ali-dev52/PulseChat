import { useAuth } from "../../context/auth";
import { getInitials, avatarColor, formatTime, truncate } from "../../utils/chat";
import { Check, CheckCheck, AlertCircle, Star } from "lucide-react";

const MessageStatusIcon = ({ status, isMyMessage }) => {
  if (!isMyMessage) return null;
  if (status === "sending") return <Check className="w-3 h-3 text-slate-400 dark:text-slate-500" />;
  if (status === "sent") return <Check className="w-3 h-3 text-slate-600 dark:text-slate-400" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-600 dark:text-slate-400" />;
  if (status === "seen") return <CheckCheck className="w-3 h-3 text-primary-500" />;
  if (status === "failed") return <AlertCircle className="w-3 h-3 text-red-500" />;
  return null;
};

const ChatItem = ({ conv, isActive, onClick }) => {
  const [Auth] = useAuth();
  const loggedInUserId = Auth?.User?._id;

  const { user, lastMessage, unread, isFavorite } = conv;

  const senderId = lastMessage?.sender?._id || lastMessage?.sender;
  const isMyMessage = String(senderId) === String(loggedInUserId);

  const preview = lastMessage?.isDeleted
    ? "This message was deleted"
    : lastMessage?.text
    ? `${isMyMessage ? "You: " : ""}${truncate(lastMessage.text, 35)}`
    : lastMessage?.image
    ? `${isMyMessage ? "You: " : ""}📷 Photo`
    : lastMessage?.audioUrl
    ? `${isMyMessage ? "You: " : ""}🎤 Voice Note`
    : "No messages yet";

  const time = formatTime(lastMessage?.createdAt);
  const [bg, fg] = avatarColor(user?._id || "");

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 transition-all duration-300 group ${
        isActive 
          ? "bg-primary-50 dark:bg-primary-500/10 border-l-4 border-l-primary-500 pl-[8px] sm:pl-[20px]" 
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent"
      }`}
    >
      {/* Avatar */}
      <div
        className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm transition-transform duration-300 ${isActive ? 'scale-105 ring-2 ring-primary-500/50' : 'group-hover:scale-105'}`}
        style={{ background: bg, color: fg }}
      >
        {getInitials(user?.full_name || user?.name)}
        {user?.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className={`text-base font-medium flex-1 min-w-0 truncate ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-white'}`}>
            {user?.full_name || user?.name || "Unknown"}
            {isFavorite && <Star className="inline w-3 h-3 ml-1 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
          </span>
          <span className={`text-[10px] sm:text-[11px] font-medium flex-shrink-0 ${
            unread > 0 ? "text-primary-500" : "text-slate-500 dark:text-slate-500"
          }`}>
            {time}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <p className={`text-sm flex-1 min-w-0 truncate flex items-center gap-1.5 ${
            unread > 0 ? "text-slate-900 dark:text-white font-medium" : "text-slate-500 dark:text-slate-400"
          }`}>
            <span className="flex-shrink-0">
              <MessageStatusIcon
                status={lastMessage?.status}
                isMyMessage={isMyMessage}
              />
            </span>
            <span className="truncate">{preview}</span>
          </p>
          {unread > 0 && (
            <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0 shadow-sm">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;