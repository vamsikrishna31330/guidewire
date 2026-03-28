import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const getStoredWorker = () => {
  const raw = localStorage.getItem("gigshield_worker");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredWorker);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem("gigshield_token");
    localStorage.removeItem("gigshield_worker");
    setUser(null);
  };

  const persistSession = (token, worker) => {
    localStorage.setItem("gigshield_token", token);
    localStorage.setItem("gigshield_worker", JSON.stringify(worker));
    setUser(worker);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("gigshield_token");

    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/api/auth/me");
      persistSession(token, response.data.data.worker);
      return response.data.data.worker;
    } catch (error) {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleForcedLogout = () => {
      clearSession();
      setLoading(false);
    };

    window.addEventListener("gigshield:logout", handleForcedLogout);
    return () => window.removeEventListener("gigshield:logout", handleForcedLogout);
  }, []);

  const registerUser = async (payload) => {
    const response = await api.post("/api/auth/register", payload);
    persistSession(response.data.data.token, response.data.data.worker);
    return response.data.data.worker;
  };

  const loginUser = async (payload) => {
    const response = await api.post("/api/auth/login", payload);
    persistSession(response.data.data.token, response.data.data.worker);
    return response.data.data.worker;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        registerUser,
        loginUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
