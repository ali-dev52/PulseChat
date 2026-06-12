
// import  {model,Schema} from 'mongoose'



// const imageSchema = new Schema({
//   url : {
//     type: String
//   },
//   key : {
//     type: String
//   }
  
// }, {timestamps: true})

// const Image = model("images", imageSchema)

// export default Image
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    // ✅ reply to specific message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "seen"],
      default: "sent",
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);