import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css'; // Lembre-se de criar e estilizar este arquivo
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // 1. NOVO ESTADO: controla a visibilidade do botão "Entrar"
  const [userInteracted, setUserInteracted] = useState(false);

  // Lógica para as partículas flutuantes (sem alterações)
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

  // 2. FUNÇÃO CHAMADA PELO CLIQUE NO BOTÃO
  const handleStart = () => {
    setUserInteracted(true); // Faz o botão desaparecer

    const video = videoRef.current;
    if (video) {
      // É aqui que a mágica acontece!
      video.muted = false;    // LIGA O SOM
      video.volume = 0.8;     // Define o volume inicial
      video.play();           // Garante que está tocando

      // Inicia a contagem regressiva para o fim da splash screen
      const fadeOutTimer = setTimeout(() => setFadeOut(true), 13000);
      const redirectTimer = setTimeout(() => navigate('/home'), 13500);

      // Função de limpeza para os timers (boa prática)
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(redirectTimer);
      };
    }
  };

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="video-background">
        <video
          ref={videoRef}
          autoPlay // Tenta tocar automaticamente
          loop
          muted    // Começa mudo para o autoplay funcionar
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
            {/* A barra de progresso só avança após a interação */}
            {userInteracted && <div className="loading-progress"></div>}
          </div>
        </div>
      </div>

      {/* 3. BOTÃO DE INTERAÇÃO QUE SÓ APARECE NO INÍCIO */}
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