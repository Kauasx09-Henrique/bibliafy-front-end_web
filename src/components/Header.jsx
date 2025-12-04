import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

import "./Header.css";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    toast.success("Sessão encerrada. Até logo! 👋", {
      duration: 2800,
      style: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        borderRadius: "14px",
      },
      iconTheme: {
        primary: "#5AC8FA",
        secondary: "#000",
      },
    });

    setTimeout(() => navigate("/login", { replace: true }), 350);
  };

  return (
    <header className="bib-header">
      <div className="bib-header-content">

        <Link to="/home" className="bib-logo">
          <img src="/Logo_Bibliafy.jpg" alt="Bibliafy" />
        </Link>

        <div className="bib-header-actions">
          {isAuthenticated && (
            <button
              className="logout-btn"
              onClick={handleLogout}
              aria-label="Sair da conta"
            >
              <LogOut size={20} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
