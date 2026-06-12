import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [Auth, setAuth] = useState({
    User: null,
    token: null,
    isReady: false, // ← prevents flicker / premature fetches
  });

  // On mount — rehydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (token && raw) {
      try {
        const User = JSON.parse(raw);
        setAuth({ User, token, isReady: true });
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ User: null, token: null, isReady: true });
      }
    } else {
      setAuth((prev) => ({ ...prev, isReady: true }));
    }
  }, []);

 const login = async (email, password) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  // backend sends "User" not "user"
  const userData = data.User || data.user;

  if (!userData || !data.token) {
    throw new Error("Invalid login response");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(userData));

  setAuth({
    User: userData,
    token: data.token,
    isReady: true,
  });

  return data;
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ User: null, token: null, isReady: true });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={[Auth, setAuth, { login, logout }]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthProvider;