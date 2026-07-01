import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { Baseurl } from "../../config/apis";
import { toast } from "react-toastify";
import { Activity, Clock, ShieldBan, User, MessageSquare, CheckCircle, Percent } from "lucide-react";
import ProfileModal from "../../components/profile/ProfileModal";

const UserDashboard = () => {
  const [auth] = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${Baseurl}/auth/dashboard-stats`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setStats(data.success.stats);
      }
    } catch (error) {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchStats();
  }, [auth]);

  const unblockUser = async (userId) => {
    try {
      const { data } = await axios.post(`${Baseurl}/auth/block/${userId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        toast.success(data.success.message);
        setStats({ ...stats, blockedUsers: stats.blockedUsers.filter(u => u._id !== userId) });
      }
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b141a]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completion = stats?.profileCompletion || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b141a] text-slate-900 dark:text-white font-sans selection:bg-primary-500/30 transition-colors duration-500 relative">
      
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar z-10">
        <div className="max-w-6xl mx-auto space-y-8 mt-4">
          
          {/* Header Card - Glassmorphism */}
          <div className="relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/20 dark:border-white/5">
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-primary-500/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary-500 to-blue-500 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-900">
                    {auth?.User?.profilepicture ? (
                      <img src={auth.User.profilepicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary-500">{auth?.User?.full_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 mb-1">
                    Welcome back, {auth?.User?.full_name?.split(' ')[0]}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Your personal communication hub.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfile(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 group"
              >
                <User size={18} className="group-hover:scale-110 transition-transform" /> 
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Stats Column */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Completion */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/20 dark:border-white/5 flex items-center gap-6 hover:shadow-md transition-all group">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="3" />
                    <path strokeDasharray={`${completion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-primary-500 transition-all duration-1000 ease-out" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">{completion}%</div>
                </div>
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Profile Setup
                  </h3>
                  <p className="text-sm font-medium">Complete your profile to connect better with others.</p>
                </div>
              </div>

              {/* Total Messages Sent */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/20 dark:border-white/5 flex flex-col justify-center hover:shadow-md transition-all">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Messages Sent
                </span>
                <div className="flex items-end gap-2">
                  <h3 className="text-5xl font-black text-slate-800 dark:text-white">{stats?.totalMessagesSent || 0}</h3>
                  <span className="text-sm text-slate-400 mb-1 font-medium">total</span>
                </div>
              </div>

              {/* Most Active Chat */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/20 dark:border-white/5 hover:shadow-md transition-all">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-orange-500" /> Most Active Chat
                </span>
                {stats?.mostActiveUser ? (
                  <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      {stats.mostActiveUser.profilepicture ? (
                        <img src={stats.mostActiveUser.profilepicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        stats.mostActiveUser.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{stats.mostActiveUser.full_name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{stats.maxMessages} messages exchanged</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm font-medium">No active chats yet.</p>
                )}
              </div>

              {/* Longest Conversation */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/20 dark:border-white/5 hover:shadow-md transition-all">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-purple-500" /> Longest Record
                </span>
                {stats?.mostActiveUser ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-purple-500">{stats.maxMessages}</h3>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Messages in a single thread</p>
                      <p className="text-xs text-slate-500 mt-1">With {stats.mostActiveUser.full_name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm font-medium">No data available.</p>
                )}
              </div>

            </div>

            {/* Blocked Users Column */}
            <div className="col-span-1">
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/20 dark:border-white/5 h-full flex flex-col">
                <h3 className="font-bold flex items-center gap-2 mb-6 text-lg">
                  <ShieldBan className="w-5 h-5 text-red-500" /> Blocked Users
                </h3>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {stats?.blockedUsers?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                      <ShieldBan className="w-12 h-12 mb-3" />
                      <p className="text-sm font-medium text-slate-500">You haven't blocked anyone.<br/>Your chat list is clear!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats?.blockedUsers?.map(user => (
                        <div key={user._id} className="flex justify-between items-center p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:border-red-200 dark:hover:border-red-900/50 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {user.profilepicture ? (
                                <img src={user.profilepicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-slate-500">{user.full_name?.charAt(0) || "?"}</span>
                              )}
                            </div>
                            <span className="font-bold text-sm truncate">{user.full_name}</span>
                          </div>
                          <button 
                            onClick={() => unblockUser(user._id)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-500/20 dark:hover:text-red-400 rounded-xl transition-colors flex-shrink-0"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {showProfile && <ProfileModal user={auth?.User} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default UserDashboard;
