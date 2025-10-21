import React, { createContext, useState, useContext, useEffect } from 'react';
// ✅ CORREÇÃO AQUI: Importa a função específica 'jwtDecode'
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        // ✅ CORREÇÃO AQUI: Chama a função importada 'jwtDecode'
        const decodedUser = jwtDecode(token); 
        // Opcional: Verificar expiração do token (se jwtDecode retornar 'exp')
        // if (decodedUser.exp * 1000 < Date.now()) {
        //   throw new Error("Token expirado");
        // }
        setUser(decodedUser);
        // Não precisa salvar de novo, já está no state
        // localStorage.setItem('token', token); 
      } catch (err) {
        console.error('Token inválido ou expirado:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      // Garante que não haja token no storage se não houver no state
      localStorage.removeItem('token'); 
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    // Salva no localStorage ANTES de atualizar o state
    localStorage.setItem('token', newToken); 
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

  // Renderiza null ou children dependendo do loading para evitar piscar
  // (Opcional, mas boa prática se o App depender do user/auth no primeiro render)
  // if (loading) {
  //   return null; // Ou um spinner global
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}