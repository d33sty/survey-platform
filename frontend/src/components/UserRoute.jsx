import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserRoute() {
  const { isUser, isAuth } = useAuth();
  const location = useLocation();
  // админ тоже имеет доступ к опросам (его токен проходит на бэкенде)
  if (isUser || isAuth) return <Outlet />;
  return <Navigate to="/enter" replace state={{ from: location }} />;
}
