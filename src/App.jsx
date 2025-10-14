import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header'; // <-- CORREÇÃO APLICADA AQUI



function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Splash dura 13,5 segundos para combinar com o fade do vídeo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 13500); // 13,5 segundos

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }


  return (
    <> {/* Usamos um fragmento para não adicionar uma div desnecessária */}
      <Header /> {/* O Header agora aparece em todas as páginas */}
      <main>
        <Outlet /> {/* O conteúdo da rota atual será renderizado aqui */}
      </main>
    </>
  );
}

export default App;
