import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.Role)) {
    return <Navigate to={`/${user.Role.toLowerCase()}`} replace />;
  }
  return children;
}