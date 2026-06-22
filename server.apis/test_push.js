import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/user.models.js";
import { MONGODB_URI } from "./config/config.js";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({ pushSubscriptions: { $exists: true, $not: { $size: 0 } } });
  console.log("Users with subscriptions:", users.length);
  if (users.length > 0) {
    console.log(users[0].pushSubscriptions);
  }
  mongoose.disconnect();
}
check();
