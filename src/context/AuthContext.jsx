import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(JSON.parse(localStorage.getItem("authTokens")).access)
      : null
  );

  const refreshToken = async () => {
    if (!authTokens?.refresh) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: authTokens.refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        const newTokens = { ...authTokens, access: data.access };
        setAuthTokens(newTokens);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(newTokens));
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (res.ok) {
        const data = await res.json(); // { access, refresh }
        
        // Store both ways for compatibility
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(data));
        
        // Also store separately for API interceptor
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };
  
  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };
  
  useEffect(() => {
    if (!authTokens) return;

    const decoded = jwtDecode(authTokens.access);
    const exp = decoded.exp * 1000;
    const now = Date.now();

    const timeout = exp - now - 30 * 1000;
    if (timeout > 0) {
      const timer = setTimeout(refreshToken, timeout);
      return () => clearTimeout(timer);
    } else {
      refreshToken();
    }
  }, [authTokens]);

  return (
    <AuthContext.Provider value={{ user, authTokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
