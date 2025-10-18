// src/components/SplashScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";

function SplashScreen() {
  const videoRef = useRef(null);
  const [showLogo, setShowLogo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Garantir autoplay
    const video = videoRef.current;
    if (video) video.play().catch(() => {});

    // Etapas revelação cinematográfica
    setTimeout(() => setShowLogo(true), 2000); // mostra logo
    setTimeout(() => setShowTitle(true), 3500); // mostra bibliafy
    setTimeout(() => setShowSubtitle(true), 5000); // mostra frase

    // Fade final e transição
    setTimeout(() => setFadeOut(true), 12500); // fade suave
    setTimeout(() => navigate("/home"), 13500);
  }, [navigate]);

  return (
    <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
      {/* 🔥 Video de fundo */}
      <video ref={videoRef} className="splash-video" muted playsInline loop>
        <source src="/videos/Intro.mp4" type="video/mp4" />
      </video>

      {/* 🖤 Overlay cinematográfico */}
      <div className="splash-overlay" />

      {/* ✨ Partículas Premium */}
      <div className="particles-layer">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      {/* 🎬 Conteúdo central */}
      <div className="splash-center">
        {showLogo && (
          <img
            src="/Logo_Branca.png"
            alt="Bibliafy"
            className="splash-logo animate-fade"
          />
        )}
        {showTitle && (
          <h1 className="splash-title animate-up">Bibliafy</h1>
        )}
        {showSubtitle && (
          <p className="splash-subtitle animate-up-delay">
            Uma jornada começa com uma palavra
          </p>
        )}

        {/* 🔥 Loading Cinematográfico */}
        <div className="cinematic-loader">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
