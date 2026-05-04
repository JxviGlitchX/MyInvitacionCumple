import { useState, useEffect } from "react";
import eventData from "../constants/eventData";

function useIsLive() {
    const [status, setStatus] = useState("before"); // "before" | "during" | "after"

    useEffect(() => {
        function verificar() {
            const ahora = new Date();
            const fiesta = new Date(eventData.date);
            /* 16 horas de duración */
            const finFiesta = new Date(fiesta.getTime() + 16 * 60 * 60 * 1000);

            if (ahora < fiesta) {
                setStatus("before");
            } else if (ahora < finFiesta) {
                setStatus("during");
            } else {
                setStatus("after");
            }
        }

        verificar();
        const intervalo = setInterval(verificar, 15000);
        return () => clearInterval(intervalo);
    }, []);

    return status;
}

export default useIsLive;