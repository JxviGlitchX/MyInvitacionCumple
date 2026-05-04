import { motion } from "framer-motion";
import eventData from "../../constants/eventData";

function Hero() {
    return (
        <section className="hero" aria-label="Encabezado de la invitación">
            {/* Línea ornamental */}
            <motion.div
                className="hero-ornament"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            />

            {/* Subtítulo */}
            <motion.p
                className="hero-sub"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                Estás invitado a mi
            </motion.p>

            {/* Título con nombre */}
            <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
            >
                Cumpleaños
            </motion.h1>

            {/* Número 22 gigante outline */}
            <motion.p
                className="hero-age"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.85, ease: "easeOut" }}
            >
                {eventData.age}
            </motion.p>

            {/* Descripción */}
            <motion.p
                className="hero-desc"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
            >
                Una celebración especial te está esperando. Guarda la fecha y
                acompáñame en esta noche inolvidable.
            </motion.p>

            {/* Indicador de scroll */}
            <motion.div
                className="hero-scroll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
            >
                <span>Desliza</span>
                <div className="scroll-line" />
            </motion.div>
        </section>
    );
}

export default Hero;