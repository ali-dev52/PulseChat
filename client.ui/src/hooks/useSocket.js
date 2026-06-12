import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/auth";

let socketInstance = null;

const useSocket = () => {
  const [Auth] = useAuth();
  const [, forceUpdate] = useState(0); // ✅ force re-render when socket connects
  const socketRef = useRef(null);

  useEffect(() => {
    if (!Auth?.User?._id || !Auth?.token) return;

    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
      return;
    }

    // ✅ cleanup stale instance
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token: Auth.token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      }
    );

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      socketInstance.emit("userOnline", Auth.User._id);
      socketRef.current = socketInstance;
      forceUpdate((n) => n + 1); // ✅ trigger re-render so useChat gets socket
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      socketRef.current = null;
      forceUpdate((n) => n + 1);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

  }, [Auth?.User?._id, Auth?.token]);

  return socketRef.current;
};
export { useSocket } from "../context/socket";