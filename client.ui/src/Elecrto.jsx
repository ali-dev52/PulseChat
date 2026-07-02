import { useState, useEffect } from "react"
import "./Css/Style.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from "./layouts/AppLayout"
import Activateaccount from "./screens/auth/Activateaccount"
import ForgotPassword from "./screens/auth/Forgetpassword"
import ResetPassword from "./screens/auth/Resetpassword"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Success from "./screens/auth/Success"
import Signup from "./screens/auth/Signup"
import Login from "./screens/auth/Login"
import OTP from "./screens/auth/OTP"
import P404 from "./screens/P404"
import ImageUpload from "./layouts/Uploading/ImageUpload"
import Chatpage from "./screens/Chatpage"
import { useAuth } from "./context/auth"
import SplashScreen from "./components/shared/SplashScreen"
import AboutApp from "./screens/info/AboutApp"
import { useWebPush } from "./hooks/useWebPush"
import AdminLayout from "./layouts/AdminLayout"
import DashboardHome from "./screens/admin/DashboardHome"
import UserManagement from "./screens/admin/UserManagement"
import ChatManagement from "./screens/admin/ChatManagement"
import UserDashboard from "./screens/user/UserDashboard"
import Profile from "./screens/user/Profile"

const Elecrto = () => {
  const [Auth] = useAuth()
  const [initialLoading, setInitialLoading] = useState(true)
  
  // Setup Web Push Subscriptions
  useWebPush()
  
  const [dark, setDark] = useState(() => {
    // Check local storage or system preference on initial load
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        return savedTheme === 'dark'
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const toggleDark = () => setDark((prev) => !prev)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-['Inter','Segoe_UI',sans-serif]">
      {initialLoading && <SplashScreen onComplete={() => setInitialLoading(false)} />}
      <div className={`transition-opacity duration-700 ${initialLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
        <Router>
          <ToastContainer theme={dark ? "dark" : "light"} />
        <Routes>
          <Route element={<AppLayout toggleDark={toggleDark} isDark={dark} />}>
            <Route path="/" element={<Chatpage toggleDark={toggleDark} isDark={dark} />} />
            <Route path="/chatpage" element={<Chatpage toggleDark={toggleDark} isDark={dark} />} />
            <Route path="/about" element={<AboutApp />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:token" element={<Activateaccount />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/success" element={<Success />} />
          <Route path="/imageupload" element={<ImageUpload />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="chats" element={<ChatManagement />} />
          </Route>

          <Route path="/*" element={<P404 />} />
        </Routes>
      </Router>
      </div>
    </div>
  )
}

export default Elecrto