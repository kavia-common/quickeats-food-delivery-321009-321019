import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute
 * Redirects to /login if unauthenticated.
 */
export function ProtectedRoute({ children }) {
  /** This is a public function. */
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
