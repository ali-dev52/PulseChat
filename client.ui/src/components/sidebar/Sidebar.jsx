import { useState } from "react";
import { useAuth } from "../../context/auth";
import { getInitials, avatarColor } from "../../utils/chat";
import ProfileModal from "../profile/ProfileModal";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Sun, Moon, LogOut, Info, Shield, LayoutDashboard, Menu } from "lucide-react";

const NAV = [
  { label: "Chats", path: "/", icon: MessageSquare },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "About", path: "/about", icon: Info },
];

const Sidebar = ({ activeTab, onSelectTab, toggleDark, isDark }) => {
  const [Auth, , { logout }] = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = Auth?.User;
  const [bg, fg] = avatarColor(user?._id || "");

  const isActivePath = (path) => location.pathname === path || (path === "/" && location.pathname === "/chatpage");

  return (
    <>
      <aside className="hidden w-20 shrink-0 flex-col border-r border-slate-200/80 bg-white/85 px-2 py-4 shadow-[12px_0_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-500 dark:border-slate-800/80 dark:bg-slate-900/85 lg:flex">
        <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 font-semibold text-white shadow-lg">P</div>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-center gap-3">
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = isActivePath(path);
            return (
              <button
                key={label}
                title={label}
                onClick={() => {
                  if (onSelectTab) onSelectTab(label);
                  navigate(path);
                }}
                className={`group flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${active ? "border-primary-500/40 bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-400 hover:bg-slate-100 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-primary-400"}`}
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            );
          })}

          <button
            onClick={() => setShowProfileModal(true)}
            title={user?.full_name || "Profile"}
            className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold transition-all duration-300 hover:border-primary-400 hover:ring-2 hover:ring-primary-500/40 dark:border-slate-700 dark:bg-slate-800"
            style={{ color: fg }}
          >
            {getInitials(user?.full_name)}
          </button>

          <button
            onClick={toggleDark}
            title="Toggle theme"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-amber-500 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user?.isadmin && (
            <button
              onClick={() => navigate("/admin")}
              title="Admin Dashboard"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-purple-500 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-400 dark:hover:bg-slate-700"
            >
              <Shield className="h-5 w-5" />
            </button>
          )}
        </div>

        <button
          onClick={logout}
          title="Logout"
          className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-red-500 transition-all duration-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 font-semibold text-white">P</div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Pulse</p>
            <p className="text-sm font-semibold">Workspace</p>
          </div>
        </div>
        <button onClick={toggleDark} className="rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {showProfileModal && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />}
    </>
  );
};

export default Sidebar;