import React, { createContext, useContext, useState } from "react";
import api from "@/api/tokenHandler";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const register = async (email, password, role, profile) => {
    try {
      setLoading(true);
      const payload = {
        email,
        password,
        role,
        ...(role === "student" ? profile : {}),
      };
      
      const response = await api.post("/auth/register", payload);
      return { success: true, message: "Registration successful" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const { token, role } = response.data;

      localStorage.setItem("token", token);
      const userData = { email, role };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, message: "Login successful", role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
