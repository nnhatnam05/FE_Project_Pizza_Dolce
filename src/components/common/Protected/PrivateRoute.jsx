import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ requiredRole = 'ADMIN' }) => {
  const token = localStorage.getItem('token');
  const rawRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login/admin" replace />;

  // Chuẩn hoá role lưu trữ các dạng: 'ADMIN', 'ROLE_ADMIN', 'STAFF', 'ROLE_STAFF'
  const normalized = (rawRole || '').toUpperCase();
  const normalizedRole = normalized.startsWith('ROLE_') ? normalized.substring(5) : normalized;

  if (normalizedRole !== requiredRole) return <Navigate to="/login/admin" replace />;

  return <Outlet />;
};

export const StaffRoute = () => {
  return <PrivateRoute requiredRole="STAFF" />;
};

export default PrivateRoute;
