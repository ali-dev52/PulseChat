import { useState } from "react";
import { useAuth } from "../../context/auth";
import { getInitials, avatarColor } from "../../utils/chat";
import ProfileModal from "../profile/ProfileModal";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Sun, Moon, LogOut, Info } from "lucide-react";

const NAV = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: "Chats",
    active: true,
  },
];

const Sidebar = ({ activeTab, onSelectTab, toggleDark }) => {
  const [Auth, , { logout }] = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const user = Auth?.User;
  const [bg, fg] = avatarColor(user?._id || "");

  return (
    <>
      <div className="w-16 md:w-20 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 flex-shrink-0 z-20 transition-colors duration-500 shadow-sm">

        {/* Top Icons Section */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          {/* Chats Navigation */}
          {NAV.map(({ icon, label }) => {
            const active = label === activeTab;
            return (
              <button
                key={label}
                title={label}
                onClick={() => onSelectTab(label)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm ${
                  active
                    ? 'bg-primary-500 text-white shadow-primary-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-500 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {icon}
              </button>
            );
          })}

          {/* Profile Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            title={user?.full_name || "Profile"}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:ring-2 hover:ring-primary-500"
          >
            <span style={{ color: fg }} className="text-xs font-bold group-hover:scale-110 transition-transform">
              {getInitials(user?.full_name)}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDark}
            title="Toggle Theme"
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-amber-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Sun className="w-5 h-5 hidden dark:block group-hover:rotate-12 transition-transform" />
            <Moon className="w-5 h-5 block dark:hidden group-hover:-rotate-12 transition-transform" />
          </button>

          {/* Info Button */}
          <button
            onClick={() => navigate("/about")}
            title="App Info"
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-teal-500 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:ring-2 hover:ring-teal-500/50"
          >
            <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom - Logout Only */}
        <button
          onClick={logout}
          title="Logout"
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

    </>
  );
};

export default Sidebar;