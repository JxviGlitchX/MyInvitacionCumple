import { motion } from "framer-motion";
import useCountdown from "../../hooks/useCountdown";
import eventData from "../../constants/eventData";

function UnidadCountdown({ valor, etiqueta }) {
    return (
        <motion.div
            className="countdown-card"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="countdown-number"
                key={valor}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {String(valor).padStart(2, "0")}
            </motion.div>
            <div className="countdown-label">{etiqueta}</div>
        </motion.div>
    );
}

function Countdown() {
    const { dias, horas, minutos, segundos } = useCountdown(eventData.date);

    const fiestaEmpezo =
        dias === 0 && horas === 0 && minutos === 0 && segundos === 0;

    if (fiestaEmpezo) {
        return (
            <section className="countdown-section" aria-label="La fiesta">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: "center", paddingTop: "40px" }}
                >
                    <p className="section-label">Es el momento</p>
                    <motion.div
                        className="party-live"
                        animate={{
                            scale: [1, 1.06, 1],
                            textShadow: [
                                "0 0 20px rgba(74,143,231,0.3)",
                                "0 0 40px rgba(74,143,231,0.6)",
                                "0 0 20px rgba(74,143,231,0.3)",
                            ],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        La fiesta está en curso
                    </motion.div>
                    <motion.p
                        className="party-sub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Nos vemos ahí
                    </motion.p>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="countdown-section" aria-label="Cuenta regresiva">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
            >
                <p className="section-label">Faltan</p>
                <h2 className="section-heading">Para la fiesta</h2>
            </motion.div>

            <motion.div
                className="countdown-grid"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: 0.15 }}
            >
                <UnidadCountdown valor={dias} etiqueta="Días" />
                <UnidadCountdown valor={horas} etiqueta="Horas" />
                <UnidadCountdown valor={minutos} etiqueta="Minutos" />
                <UnidadCountdown valor={segundos} etiqueta="Segundos" />
            </motion.div>
        </section>
    );
}

export default Countdown;