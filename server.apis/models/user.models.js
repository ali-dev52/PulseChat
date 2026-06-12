import { model, Schema } from "mongoose";

const userSchema = new Schema({
  full_name: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: ""
  },
  isOnline: {
    type: Boolean,
    default: false,
  },

  lastSeen: {
    type: Date,
  },
  isVerified: { type: Boolean, default: false },  
  verificationToken: String,
  isadmin: {
    type: Boolean,
    default: false
  },
  isblocked: {
    type: Boolean,
    default: false
  },
  isbuyer: {
    type: String,
    default: ""
  },
  profilepicture: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "buyer"
  },
  otp: {},
  resetToken: {
    type: String,
  },
  // user details
  bio: {
    type: String,
    default: ""
  },
  adress: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  state: {
    type: String,
    default: ""
  },
  countrypostalcode: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    default: ""
  },
  dob: {
    type: String,
    default: ""
  },
  phonenumber: {
    type: Number,
    default: ""
  }
}, { timestamps: true })

const user = model("users", userSchema)
export default user;