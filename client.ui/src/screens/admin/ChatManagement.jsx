import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Baseurl } from '../../config/apis';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { MessageSquare, Trash2, Eye, X } from 'lucide-react';

const ChatManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [auth] = useAuth();

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${Baseurl}/admin/conversations`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchConversations();
  }, [auth]);

  const viewChat = async (chatId) => {
    setSelectedChat(chatId);
    setMessagesLoading(true);
    try {
      const { data } = await axios.get(`${Baseurl}/admin/conversations/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const { data } = await axios.delete(`${Baseurl}/admin/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        toast.success("Message deleted");
        setMessages(messages.filter(m => m._id !== messageId));
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleDeleteConversation = async (chatId) => {
    if (!window.confirm("WARNING: This will permanently delete this conversation and ALL its messages! Proceed?")) return;
    try {
      const { data } = await axios.delete(`${Baseurl}/admin/conversations/${chatId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        toast.success("Conversation deleted");
        setConversations(conversations.filter(c => c._id !== chatId));
        if (selectedChat === chatId) setSelectedChat(null);
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chat Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Monitor and moderate conversations across the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[70vh] ${selectedChat ? 'hidden lg:flex lg:col-span-1' : 'col-span-1 lg:col-span-3'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-white flex justify-between items-center">
            <span>All Conversations</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{conversations.length}</span>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No conversations found.</div>
            ) : (
              conversations.map(chat => (
                <div 
                  key={chat._id} 
                  className={`p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors ${selectedChat === chat._id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                  onClick={() => viewChat(chat._id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-wrap gap-1">
                      {chat.participants.map(p => (
                        <span key={p._id} className="text-sm font-medium text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{p.full_name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between items-center mt-2">
                    <span>{dayjs(chat.updatedAt).format('MMM D, h:mm A')}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteConversation(chat._id); }}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete entire conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Viewer */}
        {selectedChat && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[70vh] col-span-1 lg:col-span-2 relative">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} /> Chat Log
              </h3>
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-slate-50 dark:bg-[#0b141a]">
              {messagesLoading ? (
                <div className="text-center text-slate-500 mt-10">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">No messages in this conversation.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg._id} className="flex flex-col group">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {msg.sender?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 ml-1 mb-1">{msg.sender?.full_name} • {dayjs(msg.createdAt).format('h:mm A')}</span>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800 dark:text-slate-200 relative group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                          {msg.image && (
                            <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/messages/stream-audio?url=${encodeURIComponent(msg.image)}`} alt="Sent image" className="max-w-xs rounded-xl mb-2 object-cover" />
                          )}
                          {msg.audioUrl && (
                            <audio src={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/messages/stream-audio?url=${encodeURIComponent(msg.audioUrl)}`} controls className="mb-2 max-w-xs h-10" />
                          )}
                          {msg.text && <span>{msg.text}</span>}
                          
                          <button 
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            title="Delete this message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
