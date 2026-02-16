import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("qe_user");
    if (!raw) return null;
    return safeJsonParse(raw, null);
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  try {
    if (user) localStorage.setItem("qe_user", JSON.stringify(user));
    else localStorage.removeItem("qe_user");
  } catch {
    // ignore
  }
}

/**
 * PUBLIC_INTERFACE
 * AuthProvider
 * Provides auth state and actions: login/register/logout.
 */
export function AuthProvider({ children }) {
  /** This is a public function. */
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("qe_token");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist token changes to localStorage for API client.
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Restore user if token exists (best-effort).
  useEffect(() => {
    let active = true;
    async function hydrate() {
      if (!token) return;
      try {
        // If backend supports a /me endpoint, use it. Otherwise keep stored user.
        const me = await apiRequest("/me", { method: "GET" });
        if (!active) return;
        setUser(me);
        setStoredUser(me);
      } catch {
        // ignore: backend may not implement /me in early stages
      }
    }
    hydrate();
    return () => {
      active = false;
    };
  }, [token]);

  async function doLogin({ email, password }) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        json: { email, password },
      });
      // Common patterns:
      // - { access_token, user }
      // - { token, user }
      const newToken = data.access_token || data.token;
      if (!newToken) throw new Error("Login succeeded but no token returned.");
      setToken(newToken);
      const newUser = data.user || { email };
      setUser(newUser);
      setStoredUser(newUser);
      return { token: newToken, user: newUser };
    } finally {
      setLoading(false);
    }
  }

  async function doRegister({ name, email, password }) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        json: { name, email, password },
      });
      // Some backends auto-login; if token present store it.
      const newToken = data.access_token || data.token || null;
      if (newToken) setToken(newToken);
      const newUser = data.user || { name, email };
      setUser(newUser);
      setStoredUser(newUser);
      return { token: newToken, user: newUser };
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setStoredUser(null);
    setAuthToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      error,
      login: doLogin,
      register: doRegister,
      logout,
      setError,
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useAuth
 */
export function useAuth() {
  /** This is a public function. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
