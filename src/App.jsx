import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';

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
    <main>
      <Outlet />
    </main>
  );
}

export default App;
