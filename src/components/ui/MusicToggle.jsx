import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function IconBars() {
  return (
    <div className="music-bars">
      <span className="music-bar" />
      <span className="music-bar" />
      <span className="music-bar" />
      <span className="music-bar" />
    </div>
  );
}

function MusicToggle({ audio }) {
  const [reproduciendo, setReproduciendo] = useState(true);

  useEffect(() => {
    if (!audio) return;
    setReproduciendo(true);

    function alPausar() { setReproduciendo(false); }
    function alReanudar() { setReproduciendo(true); }

    audio.addEventListener("pause", alPausar);
    audio.addEventListener("play", alReanudar);

    return () => {
      audio.removeEventListener("pause", alPausar);
      audio.removeEventListener("play", alReanudar);
    };
  }, [audio]);

  function toggle() {
    if (!audio) return;
    if (reproduciendo) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  return (
    <AnimatePresence>
      <motion.button
        className={`music-toggle ${reproduciendo ? "music-toggle--active" : ""}`}
        onClick={toggle}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        aria-label={reproduciendo ? "Pausar música" : "Reproducir música"}
      >
        {reproduciendo ? <IconBars /> : <IconPlay />}
        {reproduciendo && <span className="music-pulse-ring" />}
      </motion.button>
    </AnimatePresence>
  );
}

export default MusicToggle;