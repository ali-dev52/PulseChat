import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { Baseurl } from "../../config/apis";
import { toast } from "react-toastify";
import { Activity, Clock, ShieldBan, User, MessageSquare, CheckCircle, ArrowRight, Sparkles, ShieldCheck, BellRing, Search, Star, TrendingUp, MessageCircleMore, Lock, LayoutDashboard, MessageSquarePlus, Settings, MoonStar, SunMedium, ChevronRight, BarChart3 } from "lucide-react";

const UserDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isProMode, setIsProMode] = useState(true);

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

  const unblockUser = async (userId, userName) => {
    try {
      const { data } = await axios.post(`${Baseurl}/auth/block/${userId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        toast.success(`You unblocked ${userName}. Messaging is restored.`);
        setStats({ ...stats, blockedUsers: stats.blockedUsers.filter(u => u._id !== userId) });
      }
    } catch (error) {
      toast.error(`Failed to unblock ${userName || "user"}`);
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
  const activityData = [
    { label: "Messages", value: stats?.totalMessagesSent || 0, tone: "from-cyan-500 to-blue-500" },
    { label: "Active chat", value: stats?.maxMessages || 0, tone: "from-violet-500 to-fuchsia-500" },
    { label: "Blocked", value: stats?.blockedUsers?.length || 0, tone: "from-rose-500 to-orange-500" },
  ];
  const sectionMeta = {
    overview: {
      eyebrow: "Overview",
      title: "Your command center is ready",
      description: "Review your activity, privacy controls, and latest conversations from one polished surface.",
    },
    chats: {
      eyebrow: "Chats",
      title: "Stay in sync with your most active conversations",
      description: "Jump back into recent discussions and keep your messaging momentum alive.",
    },
    safety: {
      eyebrow: "Safety",
      title: "Privacy controls are always close at hand",
      description: "Block, unblock, and monitor your safety preferences without breaking your flow.",
    },
    settings: {
      eyebrow: "Settings",
      title: "Fine-tune your workspace for a calmer experience",
      description: "Manage profile details, preferences, and protection settings from a single place.",
    },
  };
  const quickActions = [
    { title: "Open chats", description: "Jump back into ongoing conversations", icon: MessageCircleMore, action: () => navigate("/") },
    { title: "Edit profile", description: "Keep your profile polished and complete", icon: User, action: () => navigate("/profile") },
    { title: "About app", description: "Discover the features and experience", icon: Star, action: () => navigate("/about") },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isProMode ? "bg-[radial-gradient(circle_at_top_left,_rgba(2,132,199,0.24),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#07111d_45%,_#030712_100%)] text-slate-100" : "bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7fb_50%,_#eef4ff_100%)] text-slate-900"} font-['Inter','Segoe_UI',sans-serif] selection:bg-primary-500/30 transition-colors duration-500 relative`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <aside className={`relative z-20 hidden w-72 shrink-0 border-r ${isProMode ? "border-slate-800/80 bg-slate-950/80" : "border-slate-200/80 bg-white/80"} p-5 backdrop-blur-xl lg:flex lg:flex-col`}>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-3 shadow-lg">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Pulse Dashboard</p>
            <p className={`text-xs ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Professional workspace</p>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "chats", label: "Chats", icon: MessageSquarePlus },
            { id: "safety", label: "Safety", icon: ShieldBan },
            { id: "settings", label: "Settings", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${activeSection === id ? (isProMode ? "bg-primary-500/15 text-white" : "bg-primary-50 text-primary-700") : (isProMode ? "text-slate-400 hover:bg-slate-800/70 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}`}>
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" /> {label}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </nav>

        <div className={`mt-6 rounded-[1.5rem] border p-4 ${isProMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-slate-50/80"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Pro mode</p>
              <p className={`text-xs ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Dark premium UI</p>
            </div>
            <button onClick={() => setIsProMode((prev) => !prev)} className={`rounded-2xl p-2 transition ${isProMode ? "bg-slate-800 text-white" : "bg-white text-slate-700 shadow-sm"}`}>
              {isProMode ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-auto rounded-[1.5rem] border border-slate-800/70 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4">
          <p className="text-sm font-semibold">Need a quick handoff?</p>
          <p className={`mt-1 text-sm ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Jump to your conversations or keep refining your profile.</p>
        </div>
      </aside>

      <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className={`rounded-[2rem] border p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8 ${isProMode ? "border-slate-800/80 bg-slate-900/80" : "border-slate-200/80 bg-white/80"}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-primary-500 to-blue-600 p-[2px] shadow-lg dark:border-slate-800">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-white dark:bg-slate-950">
                    {auth?.User?.profilepicture ? (
                      <img src={auth.User.profilepicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-semibold text-primary-600">{auth?.User?.full_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Dashboard</p>
                  <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${isProMode ? "text-white" : "text-slate-900"}`}>
                    Welcome back, {auth?.User?.full_name?.split(" ")[0] || "there"}
                  </h1>
                  <p className={`mt-1 text-sm ${isProMode ? "text-slate-400" : "text-slate-600"}`}>A focused workspace for your conversations, settings, and safety controls.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <div className={`rounded-[1.75rem] border p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl ${isProMode ? "border-slate-800/80 bg-slate-900/80" : "border-slate-200/80 bg-white/80"}`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isProMode ? "text-slate-400" : "text-slate-500"}`}>{sectionMeta[activeSection].eyebrow}</p>
                  <h2 className={`mt-1 text-lg font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>{sectionMeta[activeSection].title}</h2>
                  <p className={`mt-2 text-sm ${isProMode ? "text-slate-400" : "text-slate-600"}`}>{sectionMeta[activeSection].description}</p>
                </div>
                <div className="rounded-2xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {activityData.map((item) => (
                  <div key={item.label} className={`rounded-[1.2rem] border p-4 ${isProMode ? "border-slate-800 bg-slate-800/70" : "border-slate-200 bg-slate-50/80"}`}>
                    <div className={`h-2 w-full rounded-full bg-gradient-to-r ${item.tone}`} />
                    <p className={`mt-3 text-sm ${isProMode ? "text-slate-400" : "text-slate-600"}`}>{item.label}</p>
                    <p className={`mt-1 text-xl font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Quick actions</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {quickActions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.title} onClick={item.action} className={`rounded-[1.25rem] border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary-400 ${isProMode ? "border-slate-800 bg-slate-800/70 hover:bg-slate-800" : "border-slate-200 bg-slate-50/80 hover:bg-white dark:border-slate-800 dark:bg-slate-800/70 dark:hover:bg-slate-800"}`}>
                        <div className="mb-3 inline-flex rounded-2xl bg-white p-2 text-primary-600 shadow-sm dark:bg-slate-900 dark:text-primary-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className={`font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>{item.title}</p>
                        <p className={`mt-1 text-sm ${isProMode ? "text-slate-400" : "text-slate-500"}`}>{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-5 shadow-[0_12px_40px_rgba(16,185,129,0.12)] backdrop-blur-xl ${isProMode ? "border-emerald-500/20 bg-emerald-500/10" : "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10"}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/80 p-2 text-emerald-600 shadow-sm dark:bg-slate-900/70 dark:text-emerald-400">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isProMode ? "text-emerald-300" : "text-emerald-700"}`}>Smart control</p>
                  <h2 className={`mt-1 text-lg font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>Blocked contacts stay private until you choose otherwise.</h2>
                  <p className={`mt-2 text-sm ${isProMode ? "text-slate-400" : "text-slate-600"}`}>You can unblock anytime and restore the conversation instantly from the chat view.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><TrendingUp className="h-5 w-5" /></div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Profile strength</p>
                    <h3 className={`text-lg font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>{completion}% complete</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-primary-500" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${completion}, 100`} />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${isProMode ? "text-white" : "text-slate-800"}`}>{completion}%</div>
                  </div>
                  <p className={`text-sm ${isProMode ? "text-slate-400" : "text-slate-600"}`}>A fuller profile helps people recognize and trust you faster.</p>
                </div>
              </div>

              <div className={`rounded-[1.75rem] border p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl ${isProMode ? "border-slate-800/80 bg-slate-900/80" : "border-slate-200/80 bg-white/80"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-50 p-2 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"><MessageSquare className="h-5 w-5" /></div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Messaging volume</p>
                    <h3 className={`text-lg font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>{stats?.totalMessagesSent || 0} messages sent</h3>
                  </div>
                </div>
                <div className={`rounded-[1.25rem] p-4 ${isProMode ? "bg-slate-800/70" : "bg-slate-50 dark:bg-slate-800/70"}`}>
                  <p className={`text-sm ${isProMode ? "text-slate-400" : "text-slate-600"}`}>Your most active conversation is with <span className={`font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>{stats?.mostActiveUser?.full_name || "no one yet"}</span>.</p>
                  <p className={`mt-2 text-sm ${isProMode ? "text-slate-500" : "text-slate-500"}`}>{stats?.maxMessages || 0} messages exchanged so far.</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl ${isProMode ? "border-red-500/20 bg-slate-900/80" : "border-red-200/70 bg-white/80 dark:border-red-500/20 dark:bg-slate-900/80"}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-2 text-red-600 dark:bg-red-500/10 dark:text-red-400"><ShieldBan className="h-5 w-5" /></div>
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isProMode ? "text-slate-400" : "text-slate-500"}`}>Safety controls</p>
                  <h3 className={`text-lg font-semibold ${isProMode ? "text-white" : "text-slate-900"}`}>Blocked users</h3>
                </div>
              </div>
              <div className={`mb-4 rounded-[1.25rem] border p-3 text-sm ${isProMode ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50/90 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"}`}>
                <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Recovery from anywhere</div>
                <p className="mt-1">Unblock anytime and restore conversations without losing the thread.</p>
              </div>
              <div className="space-y-3">
                {(!stats?.blockedUsers || stats.blockedUsers.length === 0) ? (
                  <div className={`flex h-32 flex-col items-center justify-center rounded-[1.25rem] border border-dashed text-center ${isProMode ? "border-slate-700 bg-slate-800/50" : "border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/50"}`}>
                    <Lock className={`mb-2 h-8 w-8 ${isProMode ? "text-slate-500" : "text-slate-400"}`} />
                    <p className={`text-sm font-medium ${isProMode ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>No contacts are currently blocked.</p>
                  </div>
                ) : (
                  stats.blockedUsers.map((user) => (
                    <div key={user._id} className={`flex items-center justify-between rounded-[1.25rem] border px-3 py-3 ${isProMode ? "border-slate-800 bg-slate-800/70" : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/70"}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          {user.profilepicture ? <img src={user.profilepicture} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold text-slate-600">{user.full_name?.charAt(0) || "?"}</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.full_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Paused from messaging</p>
                        </div>
                      </div>
                      <button onClick={() => unblockUser(user._id, user.full_name)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${isProMode ? "bg-white text-slate-900 hover:bg-red-600 hover:text-white" : "bg-slate-900 text-white hover:bg-red-600 dark:bg-white dark:text-slate-900"}`}>
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
