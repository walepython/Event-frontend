import { Navigate } from "react-router-dom";

const RequireRole = ({ user, roles, children }) => {
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};

export default RequireRole;
