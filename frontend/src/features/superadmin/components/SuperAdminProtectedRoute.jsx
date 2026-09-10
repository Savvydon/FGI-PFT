import React from "react";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";
import { Navigate, Outlet } from "react-router-dom";
import { AuthLoading } from "../../auth/components/RouteGuards.jsx";

import "../styles/superadmin.css";

export default function SuperAdminProtectedRoute() {
  const { currentUser, authLoading } = useAuth();

  // Keep the current UI visible when a cached user exists while the real
  // session is verified in the background.
  if (authLoading && !currentUser) {
    return <AuthLoading />;
  }

  if (!currentUser || currentUser.role !== "super_admin") {
    if (currentUser?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser?.role === "evaluator") {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/superadmin/login" replace />;
  }

  return <Outlet />;
}
