import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Lógica para as partículas flutuantes (sem alterações)
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6
  }));

  // useEffect simplificado: apenas controla os timers de animação e redirecionamento
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Garante que o vídeo tente tocar, caso o autoplay falhe por algum motivo
      video.play().catch(() => console.error('O navegador bloqueou a reprodução automática.'));
    }

    // Inicia a contagem para o fade-out e redirecionamento
    const fadeOutTimer = setTimeout(() => setFadeOut(true), 13000);
    const redirectTimer = setTimeout(() => navigate('/home'), 13500);

    // Função de limpeza para evitar erros
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="video-background">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted // O atributo "muted" garante o autoplay
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
          <div className="loading-text">Carregando...</div>
          <div className="loading-bar">
            {/* A barra de progresso agora anima desde o início */}
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;