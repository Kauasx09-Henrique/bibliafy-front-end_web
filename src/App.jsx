import React, { useState, useEffect } from "react";
// 1. Importa useLocation
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // 2. Obtém a localização atual
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      if (window.location.pathname === "/") {
        navigate("/home", { replace: true });
      }
    }, 13500); // Reduzi um pouco o tempo para testes, ajuste se necessário

    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) return <SplashScreen />;

  // 3. Verifica se estamos na página de leitura
  const isReadingPage = location.pathname.includes("/capitulo/");

  return (
    <>
      {/* 4. Só mostra o Header se NÃO for a página de leitura */}
      {!isReadingPage && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      {/* 5. Só mostra o BottomNav se NÃO for a página de leitura */}
      {!isReadingPage && <BottomNav />}
    </>
  );
}



export default App;
