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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      if (window.location.pathname === "/") {
        navigate("/home", { replace: true });
      }
    }, 3200); 

    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) return <SplashScreen />;

  const isReadingPage = location.pathname.includes("/capitulo/");

  return (
    <>
      {!isReadingPage && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      {!isReadingPage && <BottomNav />}
    </>
  );
}

export default App;
