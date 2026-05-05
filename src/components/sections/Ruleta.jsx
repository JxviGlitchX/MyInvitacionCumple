import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORES = [
    "#4a8fe7",
    "#6aacf0",
    "#3a6fa0",
    "#2a5a9e",
    "#5ba0e8",
    "#7da0c4",
    "#3d7abf",
    "#4a8fe7",
    "#3a6fa0",
    "#6aacf0",
    "#2a5a9e",
    "#5ba0e8",
];

function Ruleta() {
    const canvasRef = useRef(null);
    const [angulo, setAngulo] = useState(0);
    const [girando, setGirando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [mostrarResultado, setMostrarResultado] = useState(false);
    const [opciones, setOpciones] = useState([]);
    const [nuevaOpcion, setNuevaOpcion] = useState("");
    const [mostrarEditor, setMostrarEditor] = useState(true);
    const anguloRef = useRef(0);
    const animacionRef = useRef(null);

    const dibujar = useCallback((anguloActual) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const tamaño = canvas.width;
        const centro = tamaño / 2;
        const radio = centro - 10;
        const total = opciones.length;

        ctx.clearRect(0, 0, tamaño, tamaño);

        if (total === 0) {
            /* Dibujar círculo vacío */
            ctx.beginPath();
            ctx.arc(centro, centro, radio, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(74, 143, 231, 0.06)";
            ctx.fill();
            ctx.strokeStyle = "rgba(74, 143, 231, 0.15)";
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "rgba(125, 160, 196, 0.4)";
            ctx.font = "16px Lato, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Agrega opciones para jugar", centro, centro - 10);
            ctx.fillText("mínimo 2", centro, centro + 14);
            return;
        }

        /* Sombra exterior */
        ctx.beginPath();
        ctx.arc(centro, centro, radio + 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74, 143, 231, 0.12)";
        ctx.fill();

        const anguloSegmento = (Math.PI * 2) / total;

        for (let i = 0; i < total; i++) {
            const inicio = anguloActual + i * anguloSegmento;
            const fin = inicio + anguloSegmento;

            ctx.beginPath();
            ctx.moveTo(centro, centro);
            ctx.arc(centro, centro, radio, inicio, fin);
            ctx.closePath();
            ctx.fillStyle = COLORES[i % COLORES.length];
            ctx.fill();
            ctx.strokeStyle = "rgba(10, 22, 40, 0.3)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.save();
            ctx.translate(centro, centro);
            ctx.rotate(inicio + anguloSegmento / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(10, Math.min(14, 160 / total))}px Lato, sans-serif`;
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 3;
            ctx.fillText(opciones[i], radio - 16, 4);
            ctx.restore();
        }

        /* Centro */
        ctx.beginPath();
        ctx.arc(centro, centro, 22, 0, Math.PI * 2);
        ctx.fillStyle = "#0a1628";
        ctx.fill();
        ctx.strokeStyle = "#4a8fe7";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centro, centro, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#4a8fe7";
        ctx.fill();

        /* Puntero */
        ctx.save();
        ctx.translate(centro, centro - radio + 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -22);
        ctx.lineTo(10, -22);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
    }, [opciones]);

    const girar = useCallback(() => {
        if (animacionRef.current) cancelAnimationFrame(animacionRef.current);

        if (opciones.length < 2) return;

        setGirando(true);
        setMostrarResultado(false);
        setResultado(null);

        const giroTotal = Math.random() * 360 + 1800;
        const velocidadInicial = 0.35;
        const desaceleracion = 0.985;
        let velocidad = velocidadInicial;
        let recorrido = 0;
        let anguloActual = anguloRef.current;

        function frame() {
            recorrido += velocidad;
            velocidad *= desaceleracion;
            anguloActual += velocidad;
            anguloRef.current = anguloActual;
            setAngulo(anguloActual);
            dibujar(anguloActual);

            if (recorrido < giroTotal) {
                animacionRef.current = requestAnimationFrame(frame);
            } else {
                const anguloNormalizado = ((anguloActual % 360) + 360) % 360;
                const anguloPuntero = (360 - anguloNormalizado + 90) % 360;
                const anguloSegmento = 360 / opciones.length;
                const indice = Math.floor(anguloPuntero / anguloSegmento) % opciones.length;

                setResultado(opciones[indice]);
                setMostrarResultado(true);
                setGirando(false);
            }
        }

        animacionRef.current = requestAnimationFrame(frame);
    }, [opciones, dibujar]);

    useEffect(() => {
        dibujar(angulo);
    }, [angulo, dibujar]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function resize() {
            const contenedor = canvas.parentElement;
            const tamaño = Math.min(contenedor.clientWidth - 20, 340);
            canvas.width = tamaño * 2;
            canvas.height = tamaño * 2;
            canvas.style.width = tamaño + "px";
            canvas.style.height = tamaño + "px";
            dibujar(anguloRef.current);
        }

        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [dibujar, angulo]);

    function agregarOpcion() {
        const text = nuevaOpcion.trim();
        if (!text) return;
        if (opciones.length >= 12) return;
        setOpciones([...opciones, text]);
        setNuevaOpcion("");
    }

    function eliminarOpcion(index) {
        setOpciones(opciones.filter((_, i) => i !== index));
    }

    return (
        <section className="ruleta-section" aria-label="Ruleta">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
            >
                <p className="section-label">Para divertirse</p>
                <h2 className="section-heading">Ruleta</h2>
            </motion.div>

            <motion.div
                className="ruleta-container"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
            >
                <div className="ruleta-canvas-wrap">
                    <canvas ref={canvasRef} />
                </div>

                <motion.button
                    className="ruleta-btn"
                    onClick={girar}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={girando || opciones.length < 2}
                >
                    {girando ? (
                        <>
                            <span className="ruleta-spinner" />
                            Girando...
                        </>
                    ) : (
                        <>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path d="M21 3v6h-6" />
                                <path d="M21 21v-6h-6" />
                            </svg>
                            Girar
                        </>
                    )}
                </motion.button>

                <AnimatePresence>
                    {mostrarResultado && resultado && (
                        <motion.div
                            className="ruleta-resultado"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <span className="ruleta-resultado-icon">🎮</span>
                            <p className="ruleta-resultado-text">{resultado}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Editor */}
            {mostrarEditor && (
                <motion.div
                    className="ruleta-editor"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {opciones.length > 0 && (
                        <div className="ruleta-editor-list">
                            {opciones.map((op, i) => (
                                <div key={i} className="ruleta-editor-item">
                                    <span className="ruleta-editor-color" style={{ background: COLORES[i % COLORES.length] }} />
                                    <span className="ruleta-editor-text">{op}</span>
                                    <button className="ruleta-editor-delete" onClick={() => eliminarOpcion(i)} aria-label="Eliminar">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {opciones.length < 12 && (
                        <div className="ruleta-editor-add">
                            <input
                                type="text"
                                placeholder="Escribe una opción..."
                                value={nuevaOpcion}
                                onChange={(e) => setNuevaOpcion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && agregarOpcion()}
                                maxLength={30}
                                className="ruleta-editor-input"
                            />
                            <button className="ruleta-editor-add-btn" onClick={agregarOpcion} disabled={!nuevaOpcion.trim()}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <p className="ruleta-editor-hint">{opciones.length}/12 opciones (mínimo 2 para girar)</p>
                </motion.div>
            )}
        </section>
    );
}

export default Ruleta;