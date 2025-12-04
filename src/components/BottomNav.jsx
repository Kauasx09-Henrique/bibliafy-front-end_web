import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Star, BookMarked, User } from "lucide-react";
import "./BottomNav.css";

const tabs = [
  { path: "/home", label: "Início", icon: Home },
  { path: "/favoritos", label: "Favoritos", icon: Star },
  { path: "/anotacoes", label: "Notas", icon: BookMarked },
  { path: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = isActive(path);

        return (
          <Link key={path} to={path} className={`nav-item ${active ? "active" : ""}`}>
            <div className={`icon-wrapper ${active ? "icon-active" : ""}`}>
              <Icon size={22} strokeWidth={active ? 2.3 : 1.7} />
            </div>
            <span className="nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
