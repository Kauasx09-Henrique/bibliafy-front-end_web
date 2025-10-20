import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// 1. Removemos Sun e Moon
import { LogOut } from "lucide-react";
import "./Header.css";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // 2. Toda a lógica de tema (useState, useEffect, applyTheme, toggleTheme) foi REMOVIDA.

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bib-header">
      <div className="bib-header-content">
        {/* 3. Logo agora é fixo (usando o logo escuro para o tema claro) */}
        <Link to="/home" className="bib-logo">
          <img src="/Logo_Bibliafy.jpg" alt="Bibliafy" /> 
        </Link>

        {/* ✅ Botões lado direito */}
        <div className="bib-header-actions">
          
          {/* 4. O Botão de Tema foi REMOVIDO daqui */}

          {/* Logout (com Acessibilidade) */}
          {isAuthenticated && (
            <button
              className="logout-btn"
              onClick={handleLogout}
              aria-label="Sair da conta"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;