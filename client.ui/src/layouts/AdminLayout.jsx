import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, LogOut, Menu, X, Megaphone } from 'lucide-react';
import { useAuth } from "../context/auth";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  if (auth?.user && !auth.user.isadmin) {
    navigate("/");
  }

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Chats', path: '/admin/chats', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Pulse Admin
          </span>
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
               {auth?.user?.full_name?.charAt(0) || 'A'}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
