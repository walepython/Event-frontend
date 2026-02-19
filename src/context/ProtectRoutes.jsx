import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const RoleRoute = ({ children, roles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (!roles.includes(user.role)) return <Navigate to="/" />; // not allowed
    return children;
  
};
