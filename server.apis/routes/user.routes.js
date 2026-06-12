import express from 'express'
import * as auth  from "../controllers/user.controllers.js"
import protectRoute from '../middlewares/authMiddleware.js'

const users = express.Router()

users.post("/pre-signup",auth.preSignup)
users.post("/signup",auth.signup)
users.post("/login",auth.login)
users.post("/forget-password",auth.forgetPassword)
users.post("/otp",auth.otp)
users.put("/reset-password/:token",auth.resetPassword)
users.get("/",auth.showAllUsers)

/* protected Route */
users.get("/fetch-logged-user", protectRoute, auth.fetchLoggedUser)
users.put("/profile", protectRoute, auth.updateProfile)


export default users;