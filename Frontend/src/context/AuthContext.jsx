import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mn_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("mn_token")) return;
    authApi.me().then((u) => {
      setUser(u);
      localStorage.setItem("mn_user", JSON.stringify(u));
    }).catch(() => {});
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const u = await authApi.login({ email, password });
      localStorage.setItem("mn_token", u.token);
      localStorage.setItem("mn_user", JSON.stringify(u));
      setUser(u);
      return u;
    } finally { setLoading(false); }
  }

  async function register(data) {
    setLoading(true);
    try {
      const u = await authApi.register(data);
      localStorage.setItem("mn_token", u.token);
      localStorage.setItem("mn_user", JSON.stringify(u));
      setUser(u);
      return u;
    } finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    setUser(null);
    window.location.href = "/login";
  }

  function refresh() {
    return authApi.me().then((u) => {
      setUser(u);
      localStorage.setItem("mn_user", JSON.stringify(u));
      return u;
    });
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);