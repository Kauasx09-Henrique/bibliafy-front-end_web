import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css'; // Precisaremos criar este arquivo de estilo
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Lógica para as partículas flutuantes
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6
  }));

  // 1. Lógica do useEffect simplificada para garantir o autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Apenas garante que o vídeo tente tocar, caso o autoplay falhe por algum motivo
      video.play().catch(() => console.error('O navegador bloqueou a reprodução automática.'));
    }

    // Timer para iniciar a animação de desaparecimento (fade-out)
    const fadeOutTimer = setTimeout(() => setFadeOut(true), 13000);

    // Timer para redirecionar o usuário para a home page 500ms após o fade-out
    const redirectTimer = setTimeout(() => navigate('/home'), 13500);

    // Função de limpeza para evitar erros se o componente for desmontado
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
          muted // 2. O atributo "muted" é essencial para o autoplay funcionar sempre!
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          {/* O vídeo deve estar em: public/videos/Intro.mp4 */}
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
          {/* 3. Caminho da imagem corrigido para buscar direto da pasta public */}
          <img src="/Logo_Bibliafy.jpg" alt="Bibliafy" className="splash-logo" />
        </div>

        <h1 className="splash-title">Bibliafy</h1>
        <p className="splash-subtitle">
          Conectando você com a <br />Palavra de Deus
        </p>

        <div className="loading-container">
          <div className="loading-text">Carregando...</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;