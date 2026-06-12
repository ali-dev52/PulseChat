import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import axios from 'axios'
import apis from "../../config/apis";
import { errortoast, successtoast, warningtoast } from "../../toastify/toastify";
import { useAuth } from "../../context/auth";
import { motion } from "framer-motion";

const Login = () => {

    const [Auth, setAuth] = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
    if(Auth?.token){
      setTimeout(() => {
       navigate("/")
      }, 2000);
    }
    },[Auth])

  const [show1, sethide1] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [user, setuser] = useState({
         email:"",
         password:""
  })

  const changehandler = (e) => {
        const name = e.target.name
        const value = e.target.value
        setuser({...user,[name]:value})
  }

  const loginhandler = async (e) => {
  try {
    e.preventDefault();
    setLoading(true);

    const { data } = await axios.post(
      `${apis.auth}/login`,
      user
    );

    const { error, warning, success } = data;

    if (error) {
      errortoast(error);
      setLoading(false);
      return;
    }

    if (warning) {
      warningtoast(warning);
      setLoading(false);
      return;
    }

    if (success) {
      const userData = data.User || data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setAuth({
        User: userData,
        token: data.token,
        isReady: true,
      });

      successtoast(success);
      navigate("/");
    }
  } catch (err) {
    console.log(err.message);
    errortoast("Login failed");
  } finally {
      setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 transition-colors duration-500">
        
        {/* Left Side: Brand/Graphic */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-accent-400/20 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse" style={{ animationDelay: "2s" }}></div>
          
          <div className="relative z-10 flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30">
               <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-bold tracking-wide">PulseChat</span>
          </div>

          <div className="relative z-10 mt-20">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Connect with <br/> your world.
            </h1>
            <p className="text-primary-100 text-lg max-w-sm">
              Experience seamless communication with our professional real-time chat platform.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 mt-20">
             <div className="flex -space-x-4">
               {[1,2,3,4].map((i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-500 bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white shadow-sm">
                   U{i}
                 </div>
               ))}
             </div>
             <p className="text-sm font-medium text-primary-100">Join 10k+ active users</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
          
          <div className="md:hidden flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
               <MessageSquare className="w-5 h-5 text-white" />
             </div>
             <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">PulseChat</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={loginhandler} className="space-y-6">

              {/* email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={user.email}
                    onChange={changehandler}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={show1 ? "text" : "password"}
                    placeholder="••••••••"
                    name="password"
                    value={user.password}
                    onChange={changehandler}
                    className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => sethide1(!show1)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {show1 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link to="/forgetpassword" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 flex justify-center items-center"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    "Sign In"
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-semibold transition-colors">
                Create one now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
