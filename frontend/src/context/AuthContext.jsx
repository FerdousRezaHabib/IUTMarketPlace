import { createContext, useContext, useState } from "react";
import * as authApi from "../api/auth";
import { decodeJwt } from "../api/jwt";

const AuthContext = createContext(null);

function userFromToken(token) {
  const claims = decodeJwt(token);
  if (!claims) return null;
  return { email: claims.sub, role: claims.role, userId: claims.userId };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? userFromToken(token) : null;
  });

  function applyToken(token) {
    localStorage.setItem("token", token);
    setUser(userFromToken(token));
  }

  async function login(credentials) {
    const { token } = await authApi.login(credentials);
    applyToken(token);
  }

  async function register(details) {
    const { token } = await authApi.register(details);
    applyToken(token);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
