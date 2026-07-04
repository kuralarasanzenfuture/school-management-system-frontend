import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { accessToken } = useSelector((state) => state.auth);

  return accessToken ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;

// Extra protection

// If the user somehow reaches /login while already authenticated (for example, by typing the URL), your PublicRoute should redirect them back to the dashboard.
