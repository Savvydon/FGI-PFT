import { API_BASE } from "../../config/env.js";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext(null);
const AUTH_USER_STORAGE_KEY = "naf_pft_current_user";

function getCachedUser() {
  try {
    const cachedUser = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
    return cachedUser ? JSON.parse(cachedUser) : null;
  } catch {
    return null;
  }
}

function cacheUser(user) {
  try {
    if (user) {
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  } catch {
    // Session storage can be unavailable in some browser/privacy modes.
  }
}

export function AuthProvider({ children }) {
  // Use the last known user immediately so protected pages do not disappear
  // while the real HTTP-only cookie session is being verified.
  const cachedUser = getCachedUser();
  const [currentUser, setCurrentUser] = useState(cachedUser);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(cachedUser));
  const hasCheckedSession = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Session invalid");
      }

      const data = await response.json();
      setCurrentUser(data);
      setIsAuthenticated(true);
      cacheUser(data);
    } catch (error) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      cacheUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Check the real server session once when the application starts.
  // The cached user keeps the previous UI available while this happens.
  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (token, userData) => {
    // The access token is handled by the backend cookie. Only non-sensitive
    // display/role information is kept in memory/session storage for fast UI.
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setAuthLoading(false);
    cacheUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
      cacheUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value = {
    currentUser,
    authLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};