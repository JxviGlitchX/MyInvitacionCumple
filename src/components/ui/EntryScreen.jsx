import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import eventData from "../../constants/eventData";

function EntryScreen({ onEntrar }) {
    const [fase, setFase] = useState("carta"); // "carta" o "en-curso"
    const [abierto, setAbierto] = useState(false);
    const [listo, setListo] = useState(false);

    useEffect(() => {
        const ahora = new Date();
        const fiesta = new Date(eventData.date);
        if (ahora >= fiesta) {
            setFase("en-curso");
        }
    }, []);

    function handleClick() {
        if (listo) return;

        if (fase === "en-curso") {
            /* Entra directo sin animación de sobre */
            setListo(true);
            const audio = new Audio("/musica.mp3");
            audio.loop = true;
            audio.volume = 0.4;
            audio.play().catch(() => { });
            onEntrar(audio);
            return;
        }

        /* Fase normal: abrir carta */
        if (abierto) return;
        setAbierto(true);

        setTimeout(() => setListo(true), 2000);

        setTimeout(() => {
            const audio = new Audio("/musica.mp3");
            audio.loop = true;
            audio.volume = 0.4;
            audio.play().catch(() => { });
            onEntrar(audio);
        }, 2400);
    }

    return (
        <AnimatePresence>
            {!listo && (
                <motion.div
                    className="entry-screen"
                    onClick={handleClick}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* ═══ CARTA (antes de la fiesta) ═══ */}
                    {fase === "carta" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="env-wrapper">
                                <div className={`env ${abierto ? "env--open" : ""}`}>
                                    <motion.div
                                        className="env-letter"
                                        animate={abierto ? { y: "-110%" } : { y: 0 }}
                                        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                                    >
                                        <div className="env-letter-inner" />
                                    </motion.div>
                                    <div className="env-body">
                                        <div className="env-fold-left" />
                                        <div className="env-fold-right" />
                                        <div className="env-seal" />
                                    </div>
                                    <div className="env-flap">
                                        <div className="env-flap-face" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {!abierto && (
                                    <motion.p
                                        className="entry-tap"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 0.5, 0.25, 0.5, 0] }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
                                    >
                                        Toca para abrir
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ═══ FIESTA EN CURSO (durante/después) ═══ */}
                    {fase === "en-curso" && (
                        <motion.div
                            className="live-entry"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="live-entry-badge">
                                <span className="live-entry-dot" />
                                EN VIVO
                            </div>

                            <motion.h1
                                className="live-entry-title"
                                animate={{
                                    textShadow: [
                                        "0 0 20px rgba(74,143,231,0.2)",
                                        "0 0 50px rgba(74,143,231,0.4)",
                                        "0 0 20px rgba(74,143,231,0.2)",
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                La fiesta
                                <br />
                                está en curso
                            </motion.h1>

                            <p className="live-entry-name">Javier — 22</p>

                            <motion.p
                                className="entry-tap"
                                animate={{ opacity: [0, 0.5, 0.25, 0.5, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                            >
                                Toca para entrar
                            </motion.p>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default EntryScreen;