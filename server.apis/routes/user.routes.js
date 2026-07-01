import express from 'express'
import {
  preSignup,
  signup,
  login,
  forgetPassword,
  otp,
  resetPassword,
  showAllUsers,
  fetchLoggedUser,
  updateProfile,
  subscribeToPush,
  getUserDashboardStats,
  toggleBlockUser
} from "../controllers/user.controllers.js"
import protectRoute from '../middlewares/authMiddleware.js'

const users = express.Router()

users.post("/pre-signup", preSignup)
users.post("/signup", signup)
users.post("/login", login)
users.post("/forget-password", forgetPassword)
users.post("/otp", otp)
users.put("/reset-password/:token", resetPassword)
users.get("/", showAllUsers)

/* protected Route */
users.get("/fetch-logged-user", protectRoute, fetchLoggedUser)
users.put("/profile", protectRoute, updateProfile)
users.post("/push-subscribe", protectRoute, subscribeToPush)

// User Dashboard & Actions
users.get("/dashboard-stats", protectRoute, getUserDashboardStats)
users.post("/block/:blockUserId", protectRoute, toggleBlockUser)

export default users;