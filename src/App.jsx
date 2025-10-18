// src/App.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./index.css";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      // Redireciona para home apenas se não estiver em login ou registro
      if (window.location.pathname === "/") {
        navigate("/home", { replace: true });
      }
    }, 13500);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) return <SplashScreen />;

  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}

export default App;
