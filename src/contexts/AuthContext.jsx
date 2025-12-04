import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Função que transforma o token decodificado em um "user" limpo e padronizado
  const formatUser = (decoded) => {
    return {
      id: decoded.id || decoded.sub || null,
      email: decoded.email || null,
      apelido: decoded.apelido || decoded.nickname || null,
      nome: decoded.name || decoded.fullName || null,

      // 🔥 Mostra sempre o nome final que vamos usar no app
      displayName:
        decoded.apelido ||
        decoded.nickname ||
        decoded.name ||
        decoded.fullName ||
        "Visitante",
    };
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // 🔥 Verifica expiração
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          throw new Error("Token expirado");
        }

        setUser(formatUser(decoded));
      } catch (err) {
        console.error("Token inválido ou expirado:", err);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      }
    } else {
      setUser(null);
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, [token]);

  // 🔥 Login salva token e dispara o useEffect
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // 🔥 Logout completo
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
