import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';
import logoImage from '/Logo_Bibliafy.jpg'; // caminho absoluto do public
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6
  }));

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.volume = 0.8; // começa em 80%
      video.play().catch(() => {
        // fallback caso autoplay seja bloqueado
        console.log('Autoplay bloqueado, tente clicar na tela');
      });
    }

    // Fade do volume ao longo de 13s
    const duration = 13000; // 13 segundos
    const steps = 100;
    const intervalTime = duration / steps;
    let currentStep = 0;

    const fadeVolume = setInterval(() => {
      currentStep++;
      if (video) {
        video.volume = Math.max(0, 0.8 * (1 - currentStep / steps));
      }
      if (currentStep >= steps) clearInterval(fadeVolume);
    }, intervalTime);

    const timer = setTimeout(() => setFadeOut(true), duration);
    const redirectTimer = setTimeout(() => navigate('/home'), duration + 500);

    return () => {
      clearInterval(fadeVolume);
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
