import React from "react";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";
import { Navigate, Outlet } from "react-router-dom";
import { AuthLoading } from "../../auth/components/RouteGuards.jsx";

export default function AdminProtectedRoute() {
  const { currentUser, authLoading } = useAuth();

  // Keep the existing page mounted when we already know the user while the
  // HTTP-only cookie is being checked in the background.
  if (authLoading && !currentUser) {
    return <AuthLoading />;
  }

  if (!currentUser || currentUser.role !== "admin") {
    if (currentUser?.role === "super_admin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    if (currentUser?.role === "evaluator") {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
