import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import bibleAnimation from "../../public/Biblia.json";
import "./SplashScreen.css";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home"), 4300);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      <motion.div
        className="splash-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
      >

        <motion.div
          className="halo-light"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.3, 1], opacity: [0, 0.8, 0.4] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        />


        <motion.div
          className="logo-wrapper"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        >
          <Lottie
            animationData={bibleAnimation}
            loop={false}
            style={{ width: 260, height: 260 }}
          />
        </motion.div>


        <motion.h1
          className="logo-text-refined"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.4, ease: "easeOut" }}
        >
          Bibliafy
        </motion.h1>

        <motion.div
          className="final-white-fade"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.2, 1] }}
          transition={{ duration: 1.4, delay: 3.4 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default SplashScreen;
