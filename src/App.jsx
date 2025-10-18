// src/App.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav"; // ✅ IMPORTADO
import "./index.css";

function App() {
  const [loading, setLoading] = useState(true);

  // Remove o tema fixo e deixa o Header controlar
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 13500); // mesmo tempo da splash

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>

      {/* ✅ MENU MOBILE FIXO */}
      <BottomNav />
    </>
  );
}

export default App;
