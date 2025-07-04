import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ requiredRole = 'ADMIN' }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'ADMIN', 'STAFF', etc.

  if (!token) return <Navigate to="/login/admin" replace />;
  if (role !== requiredRole) return <Navigate to="/login/admin" replace />;

  return <Outlet />;
};

export const StaffRoute = () => {
  return <PrivateRoute requiredRole="STAFF" />;
};

export default PrivateRoute;
