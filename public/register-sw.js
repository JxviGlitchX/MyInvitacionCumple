if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Service Worker registrado");
      })
      .catch(() => {
        console.log("Service Worker falló");
      });
  });
}