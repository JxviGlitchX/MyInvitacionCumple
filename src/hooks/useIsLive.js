import { useState, useEffect } from "react";
import eventData from "../constants/eventData";

function useIsLive() {
    const [status, setStatus] = useState("before");

    useEffect(() => {
        function verificar() {
            const ahora = new Date();
            const fiesta = new Date(eventData.date);
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
        /* Verificar cada segundo para que reaccione rápido */
        const intervalo = setInterval(verificar, 1000);
        return () => clearInterval(intervalo);
    }, []);

    return status;
}

export default useIsLive;