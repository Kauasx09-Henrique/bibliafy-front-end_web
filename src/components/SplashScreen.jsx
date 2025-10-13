import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';
import logoImage from '/Logo_Bibliafy.jpg';
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
    if (!video) return;

    video.play().catch(() => console.log('Autoplay bloqueado'));

    setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = false;
      const initialVolume = 0.8;
      const duration = 13000;
      const steps = 100;
      let currentStep = 0;
      const intervalTime = duration / steps;

      const fadeVolume = setInterval(() => {
        currentStep++;
        if (video) video.volume = Math.max(0, initialVolume * (1 - currentStep / steps));
        if (currentStep >= steps) clearInterval(fadeVolume);
      }, intervalTime);
    }, 100);


    const fadeOutTimer = setTimeout(() => setFadeOut(true), 13000);
    const redirectTimer = setTimeout(() => navigate('/home'), 13500);

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
