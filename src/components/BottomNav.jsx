import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BarChart2, BookMarked, User } from "lucide-react";
import "./BottomNav.css";

const tabs = [
  { path: "/home", label: "Início", icon: Home },
  { path: "/estatisticas", label: "Estatísticas", icon: BarChart2 },
  { path: "/anotacoes", label: "Anotações", icon: BookMarked },
  { path: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/home" && location.pathname === "/") return true;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = isActive(path);

        return (
          <Link
            key={path}
            to={path}
            className={`nav-item ${active ? "active" : ""}`}
          >
            {active && <div className="active-light" />}

            <div className="icon-box">
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
              />
            </div>
            <span className="nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}