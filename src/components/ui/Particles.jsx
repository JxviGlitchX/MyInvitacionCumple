import { useEffect, useRef } from "react";

function Particles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animacionId;
        let particulas = [];
        let raton = { x: -1000, y: -1000 };
        let scrollOffset = 0;

        function redimensionar() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function onScroll() {
            scrollOffset = window.scrollY;
            canvas.style.transform = `translate3d(0, ${scrollOffset * 0.12}px, 0)`;
        }

        function crearNebula() {
            return {
                tipo: "nebula",
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radio: Math.random() * 120 + 80,
                opacidad: Math.random() * 0.025 + 0.008,
                velocidadX: (Math.random() - 0.5) * 0.08,
                velocidadY: (Math.random() - 0.5) * 0.08,
                esAzul: Math.random() > 0.4,
            };
        }

        function crearPunto(desdeAbajo) {
            const profundidad = Math.random();
            return {
                tipo: "punto",
                x: Math.random() * canvas.width,
                y: desdeAbajo
                    ? canvas.height + Math.random() * 80
                    : Math.random() * canvas.height,
                tamaño: Math.max(0.3, profundidad * 2.5 + 0.5),
                velocidadY: -(Math.random() * 0.3 + 0.08) * (0.4 + profundidad * 0.6),
                velocidadX: (Math.random() - 0.5) * 0.15,
                opacidad: Math.random() * 0.35 + 0.08,
                opacidadMax: Math.random() * 0.35 + 0.08,
                velocidadDesvanecimiento: Math.random() * 0.0008 + 0.0003,
                profundidad,
                fase: Math.random() * Math.PI * 2,
                velocidadOscilacion: Math.random() * 0.008 + 0.003,
                esAzul: Math.random() > 0.35,
            };
        }

        function crearDestello() {
            return {
                tipo: "destello",
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                tamaño: Math.random() * 3 + 1.5,
                opacidad: 0,
                opacidadMax: Math.random() * 0.6 + 0.2,
                velocidadParpadeo: Math.random() * 0.015 + 0.005,
                fase: Math.random() * Math.PI * 2,
                duracion: Math.random() * 300 + 150,
                contador: 0,
            };
        }

        function crearReactiva() {
            return {
                tipo: "reactiva",
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                tamaño: Math.random() * 1.8 + 0.6,
                opacidad: Math.random() * 0.15 + 0.05,
                velocidadX: (Math.random() - 0.5) * 0.3,
                velocidadY: (Math.random() - 0.5) * 0.3,
                radioInfluencia: 130 + Math.random() * 90,
                esAzul: Math.random() > 0.3,
            };
        }

        function inicializar() {
            particulas = [];

            for (let i = 0; i < 8; i++) {
                particulas.push(crearNebula());
            }

            const cantidadPuntos = Math.min(200, Math.floor(canvas.width / 6));
            for (let i = 0; i < cantidadPuntos; i++) {
                particulas.push(crearPunto(false));
            }

            const cantidadDestellos = Math.min(50, Math.floor(canvas.width / 30));
            for (let i = 0; i < cantidadDestellos; i++) {
                particulas.push(crearDestello());
            }

            const cantidadReactivas = Math.min(60, Math.floor(canvas.width / 20));
            for (let i = 0; i < cantidadReactivas; i++) {
                particulas.push(crearReactiva());
            }
        }

        function dibujarConstelaciones() {
            const puntos = particulas.filter(
                (p) => p.tipo === "punto" && p.opacidad > 0.05
            );
            const maxDist = 100;

            for (let i = 0; i < puntos.length; i++) {
                for (let j = i + 1; j < puntos.length; j++) {
                    const dx = puntos[i].x - puntos[j].x;
                    const dy = puntos[i].y - puntos[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        const alpha =
                            (1 - dist / maxDist) *
                            0.08 *
                            Math.min(puntos[i].opacidad, puntos[j].opacidad);
                        ctx.strokeStyle = `rgba(106, 172, 240, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(puntos[i].x, puntos[i].y);
                        ctx.lineTo(puntos[j].x, puntos[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function dibujarEstrella(cx, cy, tamaño, opacidad) {
            const brazo = tamaño * 2.5;
            ctx.save();
            ctx.globalAlpha = opacidad;
            ctx.strokeStyle = `rgba(150, 200, 255, ${opacidad})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(cx - brazo, cy);
            ctx.lineTo(cx + brazo, cy);
            ctx.moveTo(cx, cy - brazo);
            ctx.lineTo(cx, cy + brazo);
            ctx.stroke();

            const gradiente = ctx.createRadialGradient(cx, cy, 0, cx, cy, tamaño);
            gradiente.addColorStop(0, `rgba(180, 215, 255, ${opacidad * 0.8})`);
            gradiente.addColorStop(1, `rgba(180, 215, 255, 0)`);
            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(cx, cy, tamaño, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function dibujarPunto(p) {
            const radio = Math.max(0.1, p.tamaño);
            const gradiente = ctx.createRadialGradient(
                p.x,
                p.y,
                0,
                p.x,
                p.y,
                radio * 3.5
            );

            if (p.esAzul) {
                gradiente.addColorStop(0, `rgba(120, 185, 255, ${p.opacidad})`);
                gradiente.addColorStop(
                    0.4,
                    `rgba(74, 143, 231, ${p.opacidad * 0.4})`
                );
                gradiente.addColorStop(1, `rgba(74, 143, 231, 0)`);
            } else {
                gradiente.addColorStop(
                    0,
                    `rgba(255, 255, 255, ${p.opacidad * 0.9})`
                );
                gradiente.addColorStop(
                    0.4,
                    `rgba(180, 210, 255, ${p.opacidad * 0.3})`
                );
                gradiente.addColorStop(1, `rgba(74, 143, 231, 0)`);
            }

            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radio * 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = p.esAzul
                ? `rgba(200, 225, 255, ${p.opacidad * 1.2})`
                : `rgba(255, 255, 255, ${p.opacidad * 1.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radio * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        function dibujarNebula(p) {
            const gradiente = ctx.createRadialGradient(
                p.x,
                p.y,
                0,
                p.x,
                p.y,
                Math.max(1, p.radio)
            );

            if (p.esAzul) {
                gradiente.addColorStop(0, `rgba(58, 111, 160, ${p.opacidad})`);
                gradiente.addColorStop(1, `rgba(58, 111, 160, 0)`);
            } else {
                gradiente.addColorStop(0, `rgba(106, 172, 240, ${p.opacidad})`);
                gradiente.addColorStop(1, `rgba(106, 172, 240, 0)`);
            }

            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1, p.radio), 0, Math.PI * 2);
            ctx.fill();
        }

        function animar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /* Nébulas */
            particulas.forEach((p) => {
                if (p.tipo !== "nebula") return;
                p.x += p.velocidadX;
                p.y += p.velocidadY;

                if (p.x < -p.radio) p.x = canvas.width + p.radio;
                if (p.x > canvas.width + p.radio) p.x = -p.radio;
                if (p.y < -p.radio) p.y = canvas.height + p.radio;
                if (p.y > canvas.height + p.radio) p.y = -p.radio;

                dibujarNebula(p);
            });

            /* Constelaciones */
            dibujarConstelaciones();

            /* Puntos, destellos, reactivas */
            particulas.forEach((p, i) => {
                if (p.tipo === "nebula") return;

                if (p.tipo === "punto") {
                    p.fase += p.velocidadOscilacion;
                    p.x += p.velocidadX + Math.sin(p.fase) * 0.15;
                    p.y += p.velocidadY;
                    p.opacidad -= p.velocidadDesvanecimiento;

                    if (p.opacidad <= 0 || p.y < -30) {
                        particulas[i] = crearPunto(true);
                        return;
                    }
                    dibujarPunto(p);
                }

                if (p.tipo === "destello") {
                    p.contador++;
                    p.fase += p.velocidadParpadeo;
                    p.opacidad = ((Math.sin(p.fase) + 1) / 2) * p.opacidadMax;

                    if (p.contador > p.duracion) {
                        particulas[i] = crearDestello();
                        return;
                    }
                    dibujarEstrella(p.x, p.y, p.tamaño, p.opacidad);
                }

                if (p.tipo === "reactiva") {
                    const dx = p.x - raton.x;
                    const dy = p.y - raton.y;
                    const distancia = Math.sqrt(dx * dx + dy * dy);

                    if (distancia < p.radioInfluencia && distancia > 0) {
                        const fuerza =
                            (p.radioInfluencia - distancia) / p.radioInfluencia;
                        p.velocidadX += (dx / distancia) * fuerza * 0.08;
                        p.velocidadY += (dy / distancia) * fuerza * 0.08;
                        p.opacidad = Math.min(0.5, p.opacidad + fuerza * 0.02);
                    }

                    p.velocidadX *= 0.98;
                    p.velocidadY *= 0.98;
                    p.opacidad *= 0.995;
                    if (p.opacidad < 0.04) p.opacidad = 0.04;

                    p.x += p.velocidadX;
                    p.y += p.velocidadY;

                    if (p.x < 0) {
                        p.x = 0;
                        p.velocidadX *= -0.5;
                    }
                    if (p.x > canvas.width) {
                        p.x = canvas.width;
                        p.velocidadX *= -0.5;
                    }
                    if (p.y < 0) {
                        p.y = 0;
                        p.velocidadY *= -0.5;
                    }
                    if (p.y > canvas.height) {
                        p.y = canvas.height;
                        p.velocidadY *= -0.5;
                    }

                    const radio = Math.max(0.1, p.tamaño);
                    const gradiente = ctx.createRadialGradient(
                        p.x,
                        p.y,
                        0,
                        p.x,
                        p.y,
                        radio * 3
                    );

                    if (p.esAzul) {
                        gradiente.addColorStop(
                            0,
                            `rgba(140, 195, 255, ${p.opacidad})`
                        );
                        gradiente.addColorStop(1, `rgba(74, 143, 231, 0)`);
                    } else {
                        gradiente.addColorStop(
                            0,
                            `rgba(255, 255, 255, ${p.opacidad})`
                        );
                        gradiente.addColorStop(1, `rgba(180, 210, 255, 0)`);
                    }

                    ctx.fillStyle = gradiente;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, radio * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animacionId = requestAnimationFrame(animar);
        }

        function onMouseMove(e) {
            raton.x = e.clientX;
            raton.y = e.clientY;
        }
        function onMouseLeave() {
            raton.x = -1000;
            raton.y = -1000;
        }
        function onTouchMove(e) {
            if (e.touches.length > 0) {
                raton.x = e.touches[0].clientX;
                raton.y = e.touches[0].clientY;
            }
        }
        function onTouchEnd() {
            raton.x = -1000;
            raton.y = -1000;
        }

        redimensionar();
        inicializar();
        animar();

        window.addEventListener("resize", () => {
            redimensionar();
            inicializar();
        });
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd);

        return () => {
            cancelAnimationFrame(animacionId);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
                willChange: "transform",
            }}
        />
    );
}

export default Particles;