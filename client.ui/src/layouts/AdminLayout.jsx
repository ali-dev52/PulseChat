import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/auth";
import Sidebar from "../components/sidebar/Sidebar";
import { useEffect, useState } from 'react';

const AdminLayout = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  const toggleDark = () => setDark((prev) => !prev);

  // Redirect if not admin
  useEffect(() => {
    if (auth?.isReady && (!auth?.User || !auth.User.isadmin)) {
      navigate("/");
    }
  }, [auth, navigate]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 overflow-hidden">
      <Sidebar toggleDark={toggleDark} isDark={dark} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex-1">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Pulse Admin
            </span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
               {auth?.User?.profilepicture ? (
                  <img src={auth.User.profilepicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  auth?.User?.full_name?.charAt(0) || 'A'
                )}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
