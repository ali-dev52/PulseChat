import cuser from "../models/cuser.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
// ✅ Get All Users (except logged-in user)
export const getUsers = async (req, res) => {

  try {
    const users = await cuser.find({
      _id: { $ne: req.user.id },
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const JWT_SECRET = "secret123"; // later move to .env

// ✅ Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await cuser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await cuser.create({
      name,
      email,
      password: hashedPassword,
      profilePic: `https://i.pravatar.cc/150?u=${email}`,
      verificationToken,
    });
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "alimehmood.dev@gmail.com",
        pass: "rbmz azgn pcov zsqn", // or app password if 2FA is on
      },
    });
    const verificationUrl = `http://localhost:81/verify/${verificationToken}`;
    await transporter.sendMail({
      from: "no-reply@chatme.com",
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click  <a href="${verificationUrl}" >here</a>to verify your email at chatme</p>`,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await cuser.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!user.isVerified) {
      return error("Please verify your email first", res)
    }
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await cuser.findOne({ verificationToken: token });
    if (!user) return res.status(400).send("Invalid token");

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.send("Email verified! You can now login.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};