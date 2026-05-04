import { motion } from "framer-motion";
import Button from "../ui/Button";
import useConfeti from "../ui/Confetti";
import eventData from "../../constants/eventData";

function RSVP() {
    const lanzarConfeti = useConfeti();

    const handleConfirm = (e) => {
        lanzarConfeti(e);

        setTimeout(() => {
            const url = `https://wa.me/${eventData.whatsappNumber}?text=${encodeURIComponent(
                eventData.message
            )}`;
            window.open(url, "_blank");
        }, 400);
    };

    return (
        <section className="rsvp-section" aria-label="Confirmar asistencia">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
            >
                <p className="section-label">Nos vemos pronto</p>
                <h2 className="section-heading">Confirma tu Asistencia</h2>
                <p className="rsvp-description">
                    Tu presencia es el mejor regalo. Haz clic abajo para confirmar
                    por WhatsApp.
                </p>
                <Button text="Confirmar por WhatsApp" onClick={handleConfirm} />
                <p className="rsvp-note">
                    Se abrirá una ventana de WhatsApp con el mensaje listo
                </p>
            </motion.div>
        </section>
    );
}

export default RSVP;