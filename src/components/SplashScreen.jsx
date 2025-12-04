import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import bibleAnimation from "../../public/Biblia.json";
import "./SplashScreen.css";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home", { replace: true }), 900);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <AnimatePresence>
      <motion.div
        className="splash-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }
        }
      >
        <motion.div
          className="pulse-light"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 0.35, 0.2] }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />

        <motion.div
          className="logo-wrapper"
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: [0.65, 1.12, 1] }}
          transition={{ duration: 0.50, ease: "easeOut" }}
        >
          <Lottie animationData={bibleAnimation} loop={false} style={{ width: 220 }} />
        </motion.div>

        <motion.h1
          className="logo-title"
          initial={{ opacity: 0, y: 12, letterSpacing: "12px" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "4px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          Bibliafy
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
}
