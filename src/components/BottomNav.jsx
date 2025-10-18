import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Star, BookMarked, User } from "lucide-react";
import "./BottomNav.css";

function BottomNav() {
  const location = useLocation();

  // Função para verificar rota ativa
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={`nav-item ${isActive("/home") ? "active" : ""}`}>
        <Home size={24} />
      </Link>

      <Link to="/favoritos" className={`nav-item ${isActive("/favoritos") ? "active" : ""}`}>
        <Star size={24} />
      </Link>

      <Link to="/anotacoes" className={`nav-item ${isActive("/anotacoes") ? "active" : ""}`}>
        <BookMarked size={24} />
      </Link>

      <Link to="/perfil" className={`nav-item ${isActive("/perfil") ? "active" : ""}`}>
        <User size={24} />
      </Link>
    </nav>
  );
}

export default BottomNav;
