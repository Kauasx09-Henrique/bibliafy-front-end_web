import React, { createContext, useState, useContext, useEffect } from 'react';
import * as jwt from 'jwt-decode'; // compatível com Vite

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwt(token); // ✅ aqui é só jwt(token)
        setUser(decodedUser);
        localStorage.setItem('token', token);
      } catch (err) {
        console.error('Token inválido:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
