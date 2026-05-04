import { motion } from "framer-motion";
import eventData from "../../constants/eventData";

/* ── Icono Calendario ── */
function IconCalendario() {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
            <rect x="14" y="13" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
        </svg>
    );
}

/* ── Icono Ubicación ── */
function IconUbicacion() {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

/* ── Icono Mapa (para el botón) ── */
function IconMapa() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    );
}

function Location() {
    const fecha = new Date(eventData.date);
    const opcionesFecha = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const fechaFormateada = fecha.toLocaleDateString("es-ES", opcionesFecha);
    const horaFormateada = fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <section className="details-section" aria-label="Detalles del evento">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
            >
                <p className="section-label">Todo lo que necesitas saber</p>
                <h2 className="section-heading">Detalles</h2>
            </motion.div>

            <motion.div
                className="details-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: 0.15 }}
            >
                {/* Fecha */}
                <div className="detail-block">
                    <span className="detail-icon">
                        <IconCalendario />
                    </span>
                    <h3 className="detail-title">Fecha</h3>
                    <p className="detail-text">
                        {fechaFormateada} — {horaFormateada} hrs
                    </p>
                </div>

                {/* Lugar */}
                <div className="detail-block">
                    <span className="detail-icon">
                        <IconUbicacion />
                    </span>
                    <h3 className="detail-title">Lugar</h3>
                    <p className="detail-text">{eventData.location}</p>
                </div>

                {/* Botón mapa */}
                <div className="detail-actions">
                    <a
                        href={eventData.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                    >
                        <IconMapa />
                        Ver en Google Maps
                    </a>
                </div>
            </motion.div>
        </section>
    );
}

export default Location;