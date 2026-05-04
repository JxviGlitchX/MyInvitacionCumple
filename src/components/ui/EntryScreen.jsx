import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function EntryScreen({ onEntrar }) {
    const [abierto, setAbierto] = useState(false);
    const [listo, setListo] = useState(false);

    function handleClick() {
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
                    <div className="env-wrapper">
                        <div className={`env ${abierto ? "env--open" : ""}`}>
                            {/* Carta — oculta dentro del sobre */}
                            <motion.div
                                className="env-letter"
                                animate={abierto ? { y: "-110%" } : { y: 0 }}
                                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                            >
                                <div className="env-letter-inner" />
                            </motion.div>

                            {/* Cuerpo completo del sobre */}
                            <div className="env-body">
                                {/* Triángulos laterales del sobre */}
                                <div className="env-fold-left" />
                                <div className="env-fold-right" />

                                {/* Sello */}
                                <div className="env-seal" />
                            </div>

                            {/* Solapa superior */}
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
        </AnimatePresence>
    );
}

export default EntryScreen;