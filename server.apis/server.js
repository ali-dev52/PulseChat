// import express from 'express'
// import products from './routes/products.routes.js'
// import users from './routes/user.routes.js'
// import adsRoute from './routes/ads.Routes.js'
// import orders from './routes/order.routes.js'
// import morgan from 'morgan'
// import cors from 'cors'
// import { createServer } from 'http'
// import { Server } from 'socket.io'
// import messageRoutes from "./routes/message.Routes.js"
// import conversationRoutes from "./routes/conversation.Routes.js"
// import userRoutes from "./routes/cuser.Routes.js"
// import dbconnect from './database/dbconnect.js'
// import User from './models/user.models.js' // ✅ for isOnline update

// const app = express()
// const httpServer = createServer(app)

// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:81",
//     methods: ["GET", "POST"],
//   },
// })

// const onlineUsers = new Map()

// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id)

//   // ✅ user comes online — update DB
//   socket.on("userOnline", async (userId) => {
//     try {
//       onlineUsers.set(userId, socket.id)
//       await User.findByIdAndUpdate(userId, {
//         isOnline: true,
//         lastSeen: new Date()
//       })
//       io.emit("userStatusChanged", { userId, isOnline: true })
//       console.log("Online:", userId)
//     } catch (err) {
//       console.error("userOnline error:", err)
//     }
//   })

//   // typing indicator
//   socket.on("typing", ({ conversationId, receiverId }) => {
//     const receiverSocketId = onlineUsers.get(receiverId)
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("typing", { conversationId })
//     }
//   })

//   // stop typing
//   socket.on("stopTyping", ({ conversationId, receiverId }) => {
//     const receiverSocketId = onlineUsers.get(receiverId)
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("stopTyping", { conversationId })
//     }
//   })

//   // ✅ user disconnects — update DB
//   socket.on("disconnect", async () => {
//     let disconnectedUserId = null
//     onlineUsers.forEach((socketId, userId) => {
//       if (socketId === socket.id) disconnectedUserId = userId
//     })

//     if (disconnectedUserId) {
//       try {
//         onlineUsers.delete(disconnectedUserId)
//         const now = new Date()
//         await User.findByIdAndUpdate(disconnectedUserId, {
//           isOnline: false,
//           lastSeen: now
//         })
//         io.emit("userStatusChanged", {
//           userId: disconnectedUserId,
//           isOnline: false,
//           lastSeen: now
//         })
//         console.log("Offline:", disconnectedUserId)
//       } catch (err) {
//         console.error("disconnect error:", err)
//       }
//     }
//   })
// })

// export { io, onlineUsers }

// app.use(express.json({ limit: "12mb" }))
// app.use(morgan("dev"))
// app.use(cors())

// app.get("/api/v1", (req, res) => {
//   res.json("api is running")
// })

// app.use("/api/v1/products", products)
// app.use("/api/v1/users", users)
// app.use("/api/v1/orders", orders)
// app.use("/api/v1", adsRoute)
// app.use("/api/v1/messages", messageRoutes)
// app.use("/api/v1/conversations", conversationRoutes)
// app.use("/api/v1/cusers", userRoutes)

// const port = 4321
// httpServer.listen(port, () => {
//   console.log(`The server is running on port http://localhost:${port}/api/v1`)
// })

// dbconnect()
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import { Server } from "socket.io";

import dbconnect from "./database/dbconnect.js";

// routes
import products from "./routes/products.routes.js";
import users from "./routes/user.routes.js";
import adsRoute from "./routes/ads.Routes.js";
import orders from "./routes/order.routes.js";
import messageRoutes from "./routes/message.Routes.js";
import conversationRoutes from "./routes/conversation.Routes.js";
import userRoutes from "./routes/cuser.Routes.js";

// models
import User from "./models/user.models.js";

const app = express();
const httpServer = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // ================= USER ONLINE =================
  socket.on("userOnline", async (userId) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    io.emit("userStatusChanged", {
      userId,
      isOnline: true,
    });
  });

  // ================= SEND MESSAGE =================
  socket.on("sendMessage", (message) => {
    // message: { conversationId, senderId, receiverId, text }

    const receiverSocket = onlineUsers.get(message.receiverId);

    // send to receiver instantly
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", message);
    }

    // also update sender side (optional sync)
    socket.emit("messageSent", message);

    // update chat list instantly
    io.emit("conversationUpdated", {
      conversationId: message.conversationId,
      lastMessage: message.text,
    });
  });

  // ================= TYPING =================
  socket.on("typing", ({ receiverId, conversationId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { conversationId });
    }
  });

  socket.on("stopTyping", ({ receiverId, conversationId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", { conversationId });
    }
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", async () => {
    let userId = null;

    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        userId = uid;
        onlineUsers.delete(uid);
        break;
      }
    }

    if (userId) {
      const lastSeen = new Date();

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen,
      });

      io.emit("userStatusChanged", {
        userId,
        isOnline: false,
        lastSeen,
      });
    }

    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// export io (IMPORTANT for controllers)
export { io, onlineUsers };

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "12mb" }));
app.use(cors());
app.use(morgan("dev"));

// ================= ROUTES =================
app.get("/api/v1", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api/v1/products", products);
app.use("/api/v1/users", users);
app.use("/api/v1/orders", orders);
app.use("/api/v1", adsRoute);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/cusers", userRoutes);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}/api/v1`);
});

// ================= DB =================
dbconnect();