import { useFormik } from 'formik';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, MessageSquare, ArrowRight } from 'lucide-react';
import { SignUpSchema } from '../../Schemas/Index';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apis from '../../config/apis';
import { errortoast, successtoast } from '../../toastify/toastify';
import { motion } from "framer-motion";

const SignUp = () => {

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const getEmailProvider = (email) => {
    if (email.includes("gmail")) return "https://mail.google.com";
    if (email.includes("yahoo")) return "https://mail.yahoo.com";
    if (email.includes("outlook") || email.includes("hotmail")) return "https://outlook.live.com";
    return null;
  };

  const { values, errors, handleSubmit, handleChange, handleBlur, touched } = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: SignUpSchema,

    onSubmit: async (values, action) => {
      try {
        setLoading(true);

        const { data } = await axios.post(`${apis.auth}/pre-signup`, values);
        const { success, error } = data;

        if (success) {
          successtoast(success);
          setUserEmail(values.email);
          setEmailSent(true);
          action.resetForm();
        }

        if (error) {
          action.setFieldError("email", error);
        }

      } catch (err) {
        console.log(err.message);
        errortoast("Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  const [show1, sethide1] = useState(false);
  const [show2, sethide2] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 transition-colors duration-500">
        
        {/* Left Side: Brand/Graphic */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-[10%] right-[-10%] w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-accent-400/20 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse" style={{ animationDelay: "2s" }}></div>
          
          <div className="relative z-10 flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30">
               <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-bold tracking-wide">PulseChat</span>
          </div>

          <div className="relative z-10 mt-10">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Start your <br/> journey.
            </h1>
            <p className="text-primary-100 text-lg max-w-sm">
              Create an account and connect with your team instantly.
            </p>
          </div>

          <div className="relative z-10 mt-20">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <p className="italic text-primary-50">"The best chat app we've used. It's transformed how our team communicates across timezones."</p>
              <div className="mt-4 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center font-bold">SA</div>
                 <div>
                   <p className="font-semibold text-sm">Sarah Adams</p>
                   <p className="text-xs text-primary-200">Product Manager</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
          
          <div className="md:hidden flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
               <MessageSquare className="w-5 h-5 text-white" />
             </div>
             <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">PulseChat</span>
          </div>

          {emailSent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Mail className="w-10 h-10 text-green-500 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Check your email
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">
                We've sent a verification link to <br/>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{userEmail}</span>
              </p>

              {getEmailProvider(userEmail) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(getEmailProvider(userEmail), "_blank")}
                  className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 flex justify-center items-center gap-2"
                >
                  Open Your Email <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}

              <p className="mt-8 text-sm text-slate-400">
                Didn’t receive email? Check spam folder.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Join us and start chatting today.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      value={values.full_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 shadow-sm ${errors.full_name && touched.full_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.full_name && touched.full_name && (
                    <p className='text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium pl-1'>{errors.full_name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 shadow-sm ${errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className='text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium pl-1'>{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type={show1 ? "text" : "password"}
                      placeholder="••••••••"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 shadow-sm ${errors.password && touched.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'}`}
                    />
                    <button 
                      type="button" 
                      onClick={() => sethide1(!show1)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      {show1 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className='text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium pl-1'>{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type={show2 ? "text" : "password"}
                      placeholder="••••••••"
                      name="confirm_password"
                      value={values.confirm_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 shadow-sm ${errors.confirm_password && touched.confirm_password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'}`}
                    />
                    <button 
                      type="button" 
                      onClick={() => sethide2(!show2)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      {show2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirm_password && touched.confirm_password && (
                    <p className='text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium pl-1'>{errors.confirm_password}</p>
                  )}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 flex justify-center items-center"
                >
                  {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                      "Sign Up"
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-semibold transition-colors">
                  Log In
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;