import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const PrivateRoute = ({ requiredTipo }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredTipo && user.tipo !== requiredTipo) {
    const fallback =
      user.tipo === "administrador" ? "/admin/home" : "/student/home";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
