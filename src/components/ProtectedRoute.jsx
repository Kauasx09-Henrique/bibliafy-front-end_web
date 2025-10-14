// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Se o usuário não estiver logado, redireciona para a página de login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver logado, mostra a página que ele pediu.
  return children;
}

export default ProtectedRoute;