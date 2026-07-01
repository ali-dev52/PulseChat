import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

const AppLayout = ({ toggleDark, isDark }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar toggleDark={toggleDark} isDark={isDark} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pulse</p>
            <p className="text-sm font-semibold">Workspace</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Open chats
          </button>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
