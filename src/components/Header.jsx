import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User } from "lucide-react"; // Importei o User para caso de fallback
import toast from "react-hot-toast";

import "./Header.css";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.logo_url) {
        setAvatar(user.logo_url);
      } else {
        const nameToUse = user.nickname || user.name || "Visitante";
        const generatedUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=random&color=fff&size=128&font-size=0.4`;
        setAvatar(generatedUrl);
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Até logo! 👋", {
      duration: 3000,
      style: {
        background: '#151515',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '10px'
      }
    });
    // Pequeno delay para o usuário ver o toast antes de mudar de rota
    setTimeout(() => navigate("/login", { replace: true }), 100);
  };

  if (!isAuthenticated) return null;

  return (
    <header className="bib-header glass-effect">
      <div className="bib-header-content">

        <Link to="/home" className="bib-brand">
          <span className="bib-dot" />
          <h1 className="bib-title">Bibliafy</h1>
        </Link>

        <div className="bib-header-actions">
          

          <button
            className="header-logout-btn"
            onClick={handleLogout}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={20} /> 
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;