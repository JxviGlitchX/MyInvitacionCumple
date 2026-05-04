import { useState, useEffect } from "react";

function calcularTiempoRestante(fechaObjetivo) {
  const diferencia = new Date(fechaObjetivo) - new Date();

  if (diferencia <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  return {
    dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diferencia / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diferencia / 1000 / 60) % 60),
    segundos: Math.floor((diferencia / 1000) % 60),
  };
}

function useCountdown(fechaObjetivo) {
  const [tiempoRestante, setTiempoRestante] = useState(
    calcularTiempoRestante(fechaObjetivo)
  );

  useEffect(() => {
    const temporizador = setInterval(() => {
      setTiempoRestante(calcularTiempoRestante(fechaObjetivo));
    }, 1000);

    return () => clearInterval(temporizador);
  }, [fechaObjetivo]);

  return tiempoRestante;
}

export default useCountdown;