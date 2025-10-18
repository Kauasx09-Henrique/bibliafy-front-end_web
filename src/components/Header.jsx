import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Sun, Moon, LogOut } from "lucide-react";
import "./Header.css";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  // Detecta o tema do sistema + salva no localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(defaultTheme);
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(defaultTheme + "-theme");
  }, []);

  // Alternar tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(newTheme + "-theme");
    localStorage.setItem("theme", newTheme);
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bib-header">
      <div className="bib-header-content">
        {/* ✅ Logo */}
        <Link to="/home" className="bib-logo">
          <img src="/Logo_Branca.png" alt="Bibliafy" />
        </Link>

        {/* ✅ Botões lado direito */}
        <div className="bib-header-actions">
          {/* Toggle de Tema */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Logout */}
          {isAuthenticated && (
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
