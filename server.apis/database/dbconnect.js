import mongoose from 'mongoose'
import { MONGODB_URI } from '../config/config.js'

const dbconnect = () => {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    return;
  }
  mongoose
  .connect(MONGODB_URI)
  .then((err) => console.log(`db is connected ${err.connection.db.databaseName}`))
  .catch((err) => console.log("db connection failed:", err.message))
}

export default dbconnect;