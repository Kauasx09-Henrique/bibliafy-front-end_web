import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import bibleAnimation from "../../public/Book Animation.json";
import "./SplashScreen.css";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home"), 4200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      <motion.div
        className="splash-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
      >
        {/* 🔆 Luz de fundo pulsante */}
        <motion.div
          className="light-bg"
          initial={{ scale: 0.7, opacity: 0.4 }}
          animate={{ scale: [0.7, 1.2, 1], opacity: [0.4, 0.8, 0.5] }}
          transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
        />

        {/* 📖 Animação da Bíblia */}
        <motion.div
          className="lottie-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Lottie
            animationData={bibleAnimation}
            loop={false}
            style={{ width: 260, height: 260 }}
          />
        </motion.div>

        {/* ✝️ Texto “Bibliafy” com glow */}
        <motion.h1
          className="splash-title-white"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.3, ease: "easeOut" }}
        >
          Bibliafy
        </motion.h1>

        {/* 🌤️ Fade branco final */}
        <motion.div
          className="fade-white-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.3, 1] }}
          transition={{ duration: 1.2, delay: 3.3 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default SplashScreen;
