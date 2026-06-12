import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./auth";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [Auth] = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!Auth?.User?._id || !Auth?.token) return;

    // cleanup old socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const s = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token: Auth.token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      }
    );

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      s.emit("userOnline", Auth.User._id);
      socketRef.current = s;
      setSocket(s); // ✅ triggers re-render in ALL consumers
    });

    s.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setSocket(null);
    });

    s.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [Auth?.User?._id, Auth?.token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);