import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Mostra loading antes de decidir se redireciona
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</div>;
  }

  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
