import { errortoast, successtoast, warningtoast } from '../../toastify/toastify';
import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import apis from '../../config/apis';
import axios from 'axios'
import { motion } from "framer-motion";
import { MessageSquare, Key } from "lucide-react";

const OTP = () => {
  
  const [user, setuser] = useState({
       otp:""
  })
  const [loading, setLoading] = useState(false);

  const Changehandler = (otp) => {
    setuser({ otp });
  };

  const otphandler = async (e) => {
      e.preventDefault()
      setLoading(true);
      try {
        const {data} = await axios.post(`${apis.auth}/otp`,user)
        if(data.error){
          errortoast(data.error)
        }
        if(data.warning){
          warningtoast(data.warning)
        }
        if(data.success){
          setTimeout(() => {
            location.href=`/resetpassword/${data.success.token}`
          }, 2000);
          successtoast(data.success.message)
        }
      } catch (err) {
        errortoast("Verification failed");
      } finally {
        setLoading(false);
      }
  }

  return (
     <div className="min-h-screen flex items-center justify-center p-4">
      
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 transition-colors duration-500">
        
        {/* Left Side: Brand/Graphic */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-[10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-accent-400/20 rounded-full mix-blend-overlay filter blur-[64px] animate-pulse" style={{ animationDelay: "2s" }}></div>
          
          <div className="relative z-10 flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30">
               <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-bold tracking-wide">PulseChat</span>
          </div>

          <div className="relative z-10 mt-20">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Check your <br/> inbox.
            </h1>
            <p className="text-primary-100 text-lg max-w-sm">
              We've sent a 5-digit verification code to your email address.
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
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-primary-500 dark:text-primary-400">
              <Key className="w-8 h-8" />
            </div>

            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Enter OTP</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter the One-Time Password sent to your email.</p>
            </div>
            
            <form onSubmit={otphandler} className="w-full space-y-8 flex flex-col items-center">

              {/* otp */}
              <div className="flex justify-center w-full" dir="ltr">
                <OtpInput
                  value={user.otp}
                  onChange={Changehandler}
                  numInputs={5}
                  renderSeparator={<span className="w-2 md:w-4 text-slate-400"></span>}
                  renderInput={(props) => (
                    <input 
                      {...props} 
                      className="w-12 h-14 md:w-14 md:h-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-2xl font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm" 
                    />
                  )}
                  containerStyle="flex justify-center"
                />
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || user.otp.length < 5}
                className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                type='submit'
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    "Verify OTP"
                )}
              </motion.button>
            </form>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default OTP
