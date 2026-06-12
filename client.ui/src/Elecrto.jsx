import { useState, useEffect } from "react"
import "./Css/Style.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

const Elecrto = () => {
  const [Auth] = useAuth()
  const [initialLoading, setInitialLoading] = useState(true)
  
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
      {initialLoading && <SplashScreen onComplete={() => setInitialLoading(false)} />}
      <div className={`transition-opacity duration-700 ${initialLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
        <Router>
          <ToastContainer theme={dark ? "dark" : "light"} />
        <Routes>
          <Route path="/" element={<Chatpage toggleDark={toggleDark} isDark={dark} />} />
          <Route path="/chatpage" element={<Chatpage toggleDark={toggleDark} isDark={dark} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:token" element={<Activateaccount />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/success" element={<Success />} />
          <Route path="/imageupload" element={<ImageUpload />} />
          <Route path="/about" element={<AboutApp />} />
          <Route path="/*" element={<P404 />} />
        </Routes>
      </Router>
      </div>
    </div>
  )
}

export default Elecrto