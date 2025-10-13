import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';
import logoImage from '/Logo_Bibliafy.jpg'; // arquivo dentro de public/
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Criação das partículas
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Começa autoplay, pode falhar se navegador bloquear
    video.volume = 0; // volume inicial 0 para autoplay seguro
    video.muted = true; // necessário para autoplay com som bloqueado
    video.play().catch(() => console.log('Autoplay bloqueado'));

    // Delay curto para garantir que o autoplay iniciou
    setTimeout(() => {
      video.muted = true; // habilita áudio
      const initialVolume = 0.8;
      const duration = 13000; // 13 segundos
      const steps = 100;
      const intervalTime = duration / steps;
      let currentStep = 0;

      // Fade do volume (diminuindo aos poucos)
      const fadeVolume = setInterval(() => {
        currentStep++;
        if (video) {
          video.volume = Math.max(0, initialVolume * (1 - currentStep / steps));
        }
        if (currentStep >= steps) clearInterval(fadeVolume);
      }, intervalTime);
    }, 100);

    // Fade da tela
    const timer = setTimeout(() => setFadeOut(true), 13000);

    // Redireciona para /home após o splash
    const redirectTimer = setTimeout(() => navigate('/home'), 13500);

    return () => {
      clearTimeout(timer);
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
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/Intro.mp4" type="video/mp4" />
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
          <img src={logoImage} alt="Bibliafy" className="splash-logo" />
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
