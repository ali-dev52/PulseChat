import { useAuth } from "../../context/auth";
import { getInitials, avatarColor } from "../../utils/chat";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Sun, Moon, LogOut, Info, Shield, LayoutDashboard, Users, Settings } from "lucide-react";

const NAV = [
  { label: "Chats", path: "/", icon: MessageSquare },
  { label: "Settings", path: "/dashboard", icon: Settings },
  { label: "About", path: "/about", icon: Info },
];

const ADMIN_NAV = [
  { label: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Manage Users", path: "/admin/users", icon: Users },
  { label: "Manage Chats", path: "/admin/chats", icon: MessageSquare },
];

const Sidebar = ({ activeTab, onSelectTab, toggleDark, isDark }) => {
  const [Auth, , { logout }] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = Auth?.User;
  const [bg, fg] = avatarColor(user?._id || "");

  const isActivePath = (path) => location.pathname === path || (path === "/" && location.pathname === "/chatpage");

  return (
    <aside className="flex w-16 md:w-20 shrink-0 flex-col border-r border-slate-200/80 bg-white/85 px-1 md:px-2 py-4 shadow-[12px_0_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-500 dark:border-slate-800/80 dark:bg-slate-900/85 z-50">
      

      <div className=" flex flex-1 flex-col items-center gap-3">
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
              className={`group flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl border transition-all duration-300 ${active ? "border-primary-500/40 bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-400 hover:bg-slate-100 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-primary-400"}`}
            >
              <Icon className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
            </button>
          );
        })}

        {user?.isadmin && (
          <>
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1" />
            {ADMIN_NAV.map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={label}
                  title={label}
                  onClick={() => navigate(path)}
                  className={`group flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl border transition-all duration-300 ${active ? "border-purple-500/40 bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "border-slate-200 bg-slate-50 text-purple-500 hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-400 dark:hover:bg-slate-700"}`}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
                </button>
              );
            })}
          </>
        )}

        <button
          onClick={() => navigate("/profile")}
          title={user?.full_name || "Profile"}
          className={`mt-2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl border transition-all duration-300 hover:border-primary-400 hover:ring-2 hover:ring-primary-500/40 ${location.pathname === "/profile" ? "border-primary-500 ring-2 ring-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:border-primary-500" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"}`}
          style={{ color: fg, backgroundColor: location.pathname === "/profile" ? "transparent" : undefined }}
        >
          {location.pathname === "/profile" ? (
             <div className="flex items-center justify-center w-full h-full rounded-xl md:rounded-2xl font-bold" style={{ background: bg }}>
                {getInitials(user?.full_name)}
             </div>
          ) : (
             <span className="text-xs md:text-sm font-semibold">{getInitials(user?.full_name)}</span>
          )}
        </button>

        <button
          onClick={toggleDark}
          title="Toggle theme"
          className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 text-amber-500 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
        >
          {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
        </button>
      </div>

      <button
        onClick={logout}
        title="Logout"
        className="mt-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 text-red-500 transition-all duration-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </aside>
  );
};

export default Sidebar;