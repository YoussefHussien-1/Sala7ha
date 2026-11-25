import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AuthContext from "./AuthContext";
import api from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  // Restore user session
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    let cancelled = false;

    api
      .get("/auth/me")
      .then((response) => {
        if (!cancelled) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Save authentication data
  const saveAuth = useCallback((data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    saveAuth(response.data);

    return response.data.user;
  }, [saveAuth]);

  // Register
  const register = useCallback(async (userData) => {
    const response = await api.post("/auth/register", userData);

    saveAuth(response.data);

    return response.data.user;
  }, [saveAuth]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}