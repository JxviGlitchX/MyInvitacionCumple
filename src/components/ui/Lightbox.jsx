import { useEffect } from "react";
import { motion } from "framer-motion";

function Lightbox({ media, index, onClose, onPrev, onNext }) {
    const item = media[index];

    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        }
        window.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose, onPrev, onNext]);

    return (
        <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            <button className="lightbox-nav lightbox-nav--prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Anterior">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            <motion.div
                className="lightbox-content"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
            >
                {item.type === "video" ? (
                    <video
                        src={item.src}
                        controls
                        autoPlay
                        playsInline
                        style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "8px" }}
                    />
                ) : (
                    <img
                        src={item.src}
                        alt="Foto"
                        style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "8px", objectFit: "contain" }}
                    />
                )}
            </motion.div>

            <button className="lightbox-nav lightbox-nav--next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Siguiente">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            <div className="lightbox-counter">
                {index + 1} / {media.length}
            </div>
        </motion.div>
    );
}

export default Lightbox;