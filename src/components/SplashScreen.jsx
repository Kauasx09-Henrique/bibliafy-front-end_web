import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Lógica para as partículas flutuantes
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6
  }));

  // Este useEffect garante que o vídeo comece a tocar mudo assim que a página carregar
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => console.error('Autoplay mudo foi bloqueado pelo navegador.'));
    }
  }, []); // O array vazio [] faz com que isso rode apenas uma vez

  // ✅ CORREÇÃO: Este useEffect agora gerencia os timers APÓS a interação do usuário
  useEffect(() => {
    // Só inicia os timers se o usuário já tiver clicado no botão "Entrar"
    if (userInteracted) {
      const fadeOutTimer = setTimeout(() => setFadeOut(true), 13000);
      const redirectTimer = setTimeout(() => navigate('/home'), 13500);

      // Função de limpeza para os timers. Essencial!
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [userInteracted, navigate]); // Roda sempre que 'userInteracted' mudar

  // Função chamada pelo clique no botão "Entrar"
  const handleStart = () => {
    setUserInteracted(true); // Faz o botão desaparecer e ativa o useEffect acima

    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 0.8;
      video.play();
    }
  };

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="video-background">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/Intro.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="overlay"></div>

      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      <div className="splash-container">
        <div className="logo-wrapper">
          <div className="logo-glow"></div>
          <img src="/Logo_Bibliafy.jpg" alt="Bibliafy" className="splash-logo" />
        </div>
        <h1 className="splash-title">Bibliafy</h1>
        <p className="splash-subtitle">
          Conectando você com a <br />Palavra de Deus
        </p>
        <div className="loading-container">
          <div className="loading-text">Toque em entrar para iniciar</div>
          <div className="loading-bar">
            {userInteracted && <div className="loading-progress"></div>}
          </div>
        </div>
      </div>

      {!userInteracted && (
        <div className="interaction-overlay">
          <button onClick={handleStart} className="enter-button">
            Entrar
          </button>
        </div>
      )}
    </div>
  );
}

export default SplashScreen;