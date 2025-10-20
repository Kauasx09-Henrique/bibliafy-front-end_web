import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Star, BookMarked, User } from "lucide-react";
import "./BottomNav.css";

function BottomNav() {
  const location = useLocation();

  // Função para verificar rota ativa
  // Sua função está ótima, sem necessidade de mudança
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={`nav-item ${isActive("/home") ? "active" : ""}`}>
        <Home size={24} />
        <span className="nav-label">Início</span>
      </Link>

      <Link to="/favoritos" className={`nav-item ${isActive("/favoritos") ? "active" : ""}`}>
        <Star size={24} />
        <span className="nav-label">Favoritos</span>
      </Link>

      <Link to="/anotacoes" className={`nav-item ${isActive("/anotacoes") ? "active" : ""}`}>
        <BookMarked size={24} />
        <span className="nav-label">Notas</span>
      </Link>

      <Link to="/perfil" className={`nav-item ${isActive("/perfil") ? "active" : ""}`}>
        <User size={24} />
        <span className="nav-label">Perfil</span>
      </Link>
    </nav>
  );
}

export default BottomNav;