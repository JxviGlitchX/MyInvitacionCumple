import { useCallback } from "react";

const COLORES = [
    "#4a8fe7",
    "#6aacf0",
    "#ffffff",
    "#a0cfff",
    "#3a6fa0",
    "#87ceeb",
    "#c8e1ff",
];

function lanzarExplosion(origenX, origenY) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const piezas = [];
    const TOTAL = 130;

    for (let i = 0; i < TOTAL; i++) {
        const angulo = (Math.PI * 2 * i) / TOTAL + (Math.random() - 0.5) * 0.8;
        const velocidad = Math.random() * 9 + 3;
        piezas.push({
            x: origenX,
            y: origenY,
            vx: Math.cos(angulo) * velocidad * (0.4 + Math.random() * 0.8),
            vy: Math.sin(angulo) * velocidad * (0.4 + Math.random() * 0.8) - Math.random() * 4,
            ancho: Math.random() * 9 + 4,
            alto: Math.random() * 6 + 3,
            color: COLORES[Math.floor(Math.random() * COLORES.length)],
            rotacion: Math.random() * Math.PI * 2,
            rotacionVel: (Math.random() - 0.5) * 0.35,
            gravedad: 0.1 + Math.random() * 0.1,
            friccion: 0.978,
            opacidad: 1,
            esCirculo: Math.random() > 0.7,
            wobbleOffset: Math.random() * Math.PI * 2,
        });
    }

    let frame = 0;
    const MAX_FRAMES = 200;

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        let vivas = 0;

        piezas.forEach((p) => {
            if (p.opacidad <= 0) return;
            vivas++;

            /* Wobble lateral tipo confeti real */
            p.vx += Math.sin(frame * 0.04 + p.wobbleOffset) * 0.06;

            p.vx *= p.friccion;
            p.vy *= p.friccion;
            p.vy += p.gravedad;
            p.x += p.vx;
            p.y += p.vy;
            p.rotacion += p.rotacionVel;

            if (frame > 120) {
                p.opacidad -= 0.018;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotacion);
            ctx.globalAlpha = Math.max(0, p.opacidad);
            ctx.fillStyle = p.color;

            if (p.esCirculo) {
                ctx.beginPath();
                ctx.arc(0, 0, p.ancho / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
            }

            ctx.restore();
        });

        if (vivas > 0 && frame < MAX_FRAMES) {
            requestAnimationFrame(animar);
        } else {
            canvas.remove();
        }
    }

    animar();
}

function useConfeti() {
    const lanzar = useCallback((event) => {
        if (!event?.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        lanzarExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }, []);

    return lanzar;
}

export default useConfeti;