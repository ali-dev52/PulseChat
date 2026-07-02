import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

const AppLayout = ({ toggleDark, isDark }) => {
  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar toggleDark={toggleDark} isDark={isDark} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
