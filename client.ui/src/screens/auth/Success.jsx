import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full mix-blend-overlay filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full mix-blend-overlay filter blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center"
      >
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
             <MessageSquare className="w-5 h-5 text-white" />
           </div>
           <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">PulseChat</span>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Success!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Your password has been successfully reset. You will be redirected to the login page momentarily.
        </p>

        <Link 
          to="/login"
          className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 flex justify-center items-center"
        >
          Go to Login Manually
        </Link>
      </motion.div>
    </div>
  );
};

export default Success;
