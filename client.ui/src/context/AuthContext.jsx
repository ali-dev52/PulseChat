import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider1 = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    name: "You",
    email: "you@example.com",
  },
  {
    id: 2,
    name: "ali",
    email: "you@example.com",
  }
);

  const logout = () => {
    localStorage.removeItem("token"); // if using JWT
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};