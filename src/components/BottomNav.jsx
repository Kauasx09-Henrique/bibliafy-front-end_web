import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Star, BookMarked, User } from "lucide-react";
import "./BottomNav.css";

function BottomNav() {
  const location = useLocation();

  // função para verificar rota ativa
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={isActive("/home") ? "active" : ""}>
        <Home size={22} />
      </Link>

      <Link to="/favoritos" className={isActive("/favoritos") ? "active" : ""}>
        <Star size={22} />
      </Link>

      <Link to="/anotacoes" className={isActive("/anotacoes") ? "active" : ""}>
        <BookMarked size={22} />
      </Link>

      <Link to="/perfil" className={isActive("/perfil") ? "active" : ""}>
        <User size={22} />
      </Link>
    </nav>
  );
}

export default BottomNav;
