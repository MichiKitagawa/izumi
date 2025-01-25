// client/src/components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  const currentPath = window.location.pathname;
  
  console.log('Token in ProtectedRoute (localStorage):', localStorage.getItem('token'));
  console.log('Token in ProtectedRoute (context):', token);
  console.log('Current path:', currentPath);
  console.log('Loading:', loading);

  if (loading) {
    return <div>Loading...</div>; // ローディング表示
  }

  if (!token) {
    console.log('Redirecting to /welcome because token is missing or invalid');
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default ProtectedRoute;
