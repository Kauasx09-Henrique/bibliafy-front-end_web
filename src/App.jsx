// src/App.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const authRoutes = ["/login", "/registro", "/esqueci-senha"];
  const isAuthPage = authRoutes.includes(location.pathname);

  useEffect(() => {
    const noSplash = sessionStorage.getItem("noSplash");

    if (isAuthPage) {
      setLoading(false);
      return;
    }

    if (noSplash === "true") {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);

      if (window.location.pathname === "/") {
        navigate("/home", { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname, isAuthPage, navigate]);

  if (loading && !isAuthPage) return <SplashScreen />;

  const isReadingPage = location.pathname.includes("/capitulo/");

  return (
    <>
      {!isReadingPage && !isAuthPage && <Header />}

      <main className="main-content">
        <Outlet />
      </main>

      {!isReadingPage && !isAuthPage && <BottomNav />}
    </>
  );
}

export default App;
