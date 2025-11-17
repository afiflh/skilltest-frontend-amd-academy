// Protected Route Component
// Melindungi halaman dari akses tanpa login
// Jika user belum login, redirect ke halaman login

import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Cek apakah user sudah login
  if (!isAuthenticated()) {
    // Redirect ke login jika belum login
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, tampilkan content yang diminta
  return <>{children}</>;
};

export default ProtectedRoute;