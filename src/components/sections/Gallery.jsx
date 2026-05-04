import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadPhoto, uploadVideo, getPhotos, deletePhoto } from "../../lib/api";
import Lightbox from "../ui/Lightbox";

/* Redimensionar imagen */
function resizeImage(file, maxWidth = 600, quality = 0.6) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Solo imágenes"));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = () => reject(new Error("Error cargando imagen"));
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/* Leer video como base64 */
function leerVideo(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("video/")) {
            reject(new Error("Solo videos"));
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            reject(new Error("Video muy grande (máximo 50MB)"));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Error leyendo video"));
        reader.readAsDataURL(file);
    });
}

function getUserId() {
    let id = sessionStorage.getItem("gallery-uid");
    if (!id) {
        id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        sessionStorage.setItem("gallery-uid", id);
    }
    return id;
}

function pedirPermisoNotificaciones() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    Notification.requestPermission().then((permiso) => permiso === "granted");
    return false;
}

function enviarNotificacionNavegador() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;

    const notif = new Notification("Fiesta de Javier", {
        body: "📸 Alguien subió una foto o video nuevo",
        tag: "foto-nueva",
        silent: false,
    });

    notif.onclick = () => {
        window.focus();
        notif.close();
    };

    setTimeout(() => notif.close(), 5000);
}

function Gallery() {
    const [media, setMedia] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [toast, setToast] = useState(null);
    const [toastError, setToastError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [workerListo, setWorkerListo] = useState(true);
    const [notifStatus, setNotifStatus] = useState("idle");
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const userId = useRef(getUserId());
    const isFirstLoad = useRef(true);
    const prevCount = useRef(0);
    const intervalRef = useRef(null);
    const fallosRef = useRef(0);

    useEffect(() => {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") setNotifStatus("granted");
        else if (Notification.permission === "denied") setNotifStatus("denied");
    }, []);

    useEffect(() => {
        if (notifStatus !== "idle") return;
        const handleView = () => {
            const granted = pedirPermisoNotificaciones();
            if (granted) setNotifStatus("granted");
        };
        window.addEventListener("scroll", handleView, { once: true, passive: true });
        window.addEventListener("click", handleView, { once: true, passive: true });
        return () => {
            window.removeEventListener("scroll", handleView);
            window.removeEventListener("click", handleView);
        };
    }, [notifStatus]);

    const fetchPhotos = useCallback(async () => {
        try {
            const photos = await getPhotos();
            if (!photos.error) {
                fallosRef.current = 0;
                setWorkerListo(true);
            }
            setMedia(photos);
            if (!isFirstLoad.current && photos.length > prevCount.current) {
                const newest = photos[0];
                if (newest?.uploadedBy && newest.uploadedBy !== userId.current) {
                    setToast("Alguien subió algo nuevo");
                    setTimeout(() => setToast(null), 3500);
                    enviarNotificacionNavegador();
                }
            }
            prevCount.current = photos.length;
            isFirstLoad.current = false;
        } catch (err) {
            fallosRef.current += 1;
            if (fallosRef.current >= 3) {
                setWorkerListo(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }
    }, []);

    useEffect(() => {
        fetchPhotos();
        intervalRef.current = setInterval(fetchPhotos, 3000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchPhotos]);

    const procesarArchivos = useCallback(async (files) => {
        const archivos = Array.from(files).filter(
            (f) =>
                (f.type.startsWith("image/") && f.size <= 15 * 1024 * 1024) ||
                (f.type.startsWith("video/") && f.size <= 50 * 1024 * 1024)
        );
        if (archivos.length === 0) return;
        setUploading(true);

        for (const file of archivos) {
            try {
                if (file.type.startsWith("image/")) {
                    const base64 = await resizeImage(file, 600, 0.6);
                    const resultado = await uploadPhoto(base64);
                    if (resultado.error) { setWorkerListo(false); break; }
                } else if (file.type.startsWith("video/")) {
                    const base64 = await leerVideo(file);
                    const resultado = await uploadVideo(base64);
                    if (resultado.error) { setWorkerListo(false); break; }
                }
            } catch (err) {
                setToastError(err.message);
                setTimeout(() => setToastError(null), 3000);
                break;
            }
        }

        setUploading(false);
        fetchPhotos();
    }, [fetchPhotos]);

    function handleUpload(e) {
        procesarArchivos(e.target.files);
        e.target.value = "";
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) {
            procesarArchivos(e.dataTransfer.files);
        }
    }

    async function handleDelete(id, e) {
        e.stopPropagation();

        const pin = prompt("Ingresa el PIN para eliminar:");
        if (!pin) return;

        try {
            const resultado = await deletePhoto(id, pin);
            if (resultado.error) {
                setToastError("PIN incorrecto");
                setTimeout(() => setToastError(null), 3000);
                return;
            }
            fetchPhotos();
        } catch (err) {
            setToastError(err.message || "No se pudo eliminar");
            setTimeout(() => setToastError(null), 3000);
        }
    }

    const getGridClass = (i) => {
        const p = ["wide", "normal", "tall", "normal", "normal", "wide", "normal", "tall"];
        return `gallery-item--${p[i % p.length]}`;
    };

    return (
        <section className="gallery-section" aria-label="Galería en vivo">
            {/* Toasts */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="gallery-toast"
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                    >
                        <span className="gallery-toast-dot" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toastError && (
                    <motion.div
                        className="gallery-toast gallery-toast--error"
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                    >
                        {toastError}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
            >
                <div className="gallery-header">
                    <p className="section-label">En vivo desde la fiesta</p>
                    <h2 className="section-heading">
                        <span className="gallery-live-title">
                            Fotos en vivo
                            <span className="live-badge">EN VIVO</span>
                        </span>
                    </h2>
                </div>
            </motion.div>

            {/* Worker no listo */}
            {!workerListo && (
                <motion.div className="notif-prompt notif-prompt--denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>Servidor de fotos no configurado aún.</p>
                </motion.div>
            )}

            {/* Notificaciones */}
            {workerListo && notifStatus === "idle" && (
                <motion.div className="notif-prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    <p>Permite notificaciones para saber cuando suban algo</p>
                    <button className="notif-prompt-btn" onClick={() => {
                        const granted = pedirPermisoNotificaciones();
                        setNotifStatus(granted ? "granted" : "denied");
                    }}>
                        Permitir
                    </button>
                </motion.div>
            )}

            {workerListo && notifStatus === "granted" && (
                <motion.div className="notif-prompt notif-prompt--granted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    <p>Notificaciones activadas</p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                </motion.div>
            )}

            {workerListo && notifStatus === "denied" && (
                <motion.div className="notif-prompt notif-prompt--denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    <p>Notificaciones bloqueadas</p>
                </motion.div>
            )}

            {/* Subida */}
            {workerListo && (
                <motion.div
                    className={`gallery-upload ${dragging ? "gallery-upload--active" : ""} ${uploading ? "gallery-upload--uploading" : ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        style={{ display: "none" }}
                        disabled={uploading}
                    />
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                            if (e.target.files[0]) procesarArchivos(e.target.files);
                            e.target.value = "";
                        }}
                        style={{ display: "none" }}
                        disabled={uploading}
                    />
                    <div className="gallery-upload-buttons">
                        <button
                            className="gallery-upload-btn"
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <><span className="gallery-spinner" /> Subiendo...</>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                                    </svg>
                                    Subir fotos
                                </>
                            )}
                        </button>
                        <button
                            className="gallery-upload-btn gallery-upload-btn--video"
                            onClick={() => !uploading && videoInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                            </svg>
                            Subir video
                        </button>
                    </div>
                    <p className="gallery-upload-hint">
                        {dragging ? "Suelta aquí" : "o arrastra archivos aquí (fotos o videos)"}
                    </p>
                    <p className="gallery-upload-count">
                        {media.length} archivo{media.length !== 1 ? "s" : ""}
                    </p>
                </motion.div>
            )}

            {/* Collage */}
            {media.length > 0 && (
                <motion.div
                    className="gallery-grid"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                >
                    <AnimatePresence>
                        {media.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className={`gallery-item ${getGridClass(index)}`}
                                layout
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.35 }}
                                onClick={() => setLightboxIndex(index)}
                            >
                                {item.type === "video" ? (
                                    <video src={item.src} muted playsInline preload="metadata" />
                                ) : (
                                    <img src={item.src} alt="Foto" loading="lazy" />
                                )}
                                <div className="gallery-item-overlay">
                                    {item.type === "video" && (
                                        <svg className="gallery-play-icon" width="32" height="32" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                    {/* Botón eliminar — siempre visible para ti */}
                                    <button
                                        className="gallery-delete-btn"
                                        onClick={(e) => handleDelete(item.id, e)}
                                        aria-label="Eliminar"
                                        title="Eliminar"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Vacío */}
            {media.length === 0 && workerListo && (
                <motion.div className="gallery-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                    <p>Sé el primero en subir algo</p>
                </motion.div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <Lightbox
                        media={media}
                        index={lightboxIndex}
                        onClose={() => setLightboxIndex(null)}
                        onPrev={() => setLightboxIndex((i) => (i > 0 ? i - 1 : media.length - 1))}
                        onNext={() => setLightboxIndex((i) => (i < media.length - 1 ? i + 1 : 0))}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}

export default Gallery;