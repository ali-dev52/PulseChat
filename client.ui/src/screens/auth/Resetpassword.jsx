import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { useParams } from "react-router-dom";
import axios from "axios";
import apis from "../../config/apis";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, MessageSquare, ShieldCheck } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerMessage({ type: "", text: "" }); // reset message before submit
    try {
      const { data } = await axios.put(`${apis.auth}/reset-password/${token}`, values);
      const { error, warning, success } = data;

      if (error) setServerMessage({ type: "error", text: error });
      else if (warning) setServerMessage({ type: "warning", text: warning });
      else if (success) {
        setServerMessage({ type: "success", text: success });
        setTimeout(() => {
          location.href = "/success";
        }, 2000);
      }
    } catch (err) {
      setServerMessage({ type: "error", text: "Something went wrong!" });
    } finally {
      setSubmitting(false);
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "error":
        return "text-red-500 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border-red-500/50";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 border-yellow-500/50";
      case "success":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 border-green-500/50";
      default:
        return "hidden";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 transition-colors duration-500">
        
        {/* Left Side: Brand/Graphic */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-accent-400/20 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse" style={{ animationDelay: "2s" }}></div>
          
          <div className="relative z-10 flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30">
               <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-bold tracking-wide">PulseChat</span>
          </div>

          <div className="relative z-10 mt-20">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Secure your <br/> account.
            </h1>
            <p className="text-primary-100 text-lg max-w-sm">
              Please enter a strong, new password that you haven't used before.
            </p>
          </div>

          <div className="relative z-10 mt-20" />
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
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new secure password</p>
            </div>

            {/* Server Message */}
            {serverMessage.text && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border px-4 py-3 mb-6 rounded-xl text-center font-medium backdrop-blur-md text-sm ${getColor(
                  serverMessage.type
                )}`}
              >
                {serverMessage.text}
              </motion.div>
            )}

            <Formik
              initialValues={{ password: "", confirm_password: "" }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                      <Field
                        type={show1 ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShow1(!show1)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        {show1 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <ShieldCheck className="w-5 h-5 text-slate-400" />
                      </div>
                      <Field
                        type={show2 ? "text" : "password"}
                        name="confirm_password"
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShow2(!show2)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        {show2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 flex justify-center items-center disabled:opacity-50"
                  >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "Reset Password"
                    )}
                  </motion.button>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
