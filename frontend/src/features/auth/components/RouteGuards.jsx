import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";

export function AuthLoading({ fullScreen = true }) {
  return (
    <div className={fullScreen ? "route-loading" : "route-loading route-loading-inline"}>
      <div className="route-loading-spinner" aria-hidden="true" />
      <div>
        <strong>Loading your session</strong>
        <p>Please wait a moment...</p>
      </div>
    </div>
  );
}

export function AuthRefreshIndicator() {
  const { authLoading, currentUser } = useAuth();

  // When a cached user exists, the actual page remains visible. This small
  // indicator tells the user that the session is being verified in the
  // background instead of replacing the whole page with a white screen.
  if (!authLoading || !currentUser) return null;

  return (
    <div className="auth-refresh-indicator" role="status" aria-live="polite">
      <span className="auth-refresh-spinner" aria-hidden="true" />
      Checking session...
    </div>
  );
}

export function EvaluatorProtectedRoute() {
  const { currentUser, authLoading } = useAuth();

  // If we have a cached user, keep rendering the previous/current page while
  // the server validates the cookie session in the background.
  if (authLoading && !currentUser) return <AuthLoading />;

  if (!currentUser || currentUser.role !== "evaluator") {
    if (currentUser?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser?.role === "super_admin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function LoginRedirect({ children }) {
  const { currentUser, authLoading } = useAuth();

  // A cached user lets us redirect immediately. The server check continues in
  // the background and will clear the cached user if the session is invalid.
  if (authLoading && !currentUser) return <AuthLoading />;

  if (currentUser?.role === "super_admin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }
  if (currentUser?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (currentUser?.role === "evaluator") {
    return <Navigate to="/" replace />;
  }

  return children;
}
