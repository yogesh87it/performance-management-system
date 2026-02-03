import React from "react";
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ReactRouterDOM.Navigate to="/auth" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to a default page if role is not allowed
    return <ReactRouterDOM.Navigate to="/my-kra" replace />;
  }

  return <ReactRouterDOM.Outlet />;
};

export default ProtectedRoute;
