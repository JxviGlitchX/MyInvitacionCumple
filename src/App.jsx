import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Particles from "./components/ui/Particles";
import MusicToggle from "./components/ui/MusicToggle";
import EntryScreen from "./components/ui/EntryScreen";
import Hero from "./components/sections/Hero";
import Countdown from "./components/sections/Countdown";
import Location from "./components/sections/Location";
import Ruleta from "./components/sections/Ruleta";
import Gallery from "./components/sections/Gallery";
import RSVP from "./components/sections/RSVP";
import useIsLive from "./hooks/useIsLive";

function App() {
  const [adentro, setAdentro] = useState(false);
  const [audio, setAudio] = useState(null);
  const status = useIsLive();

  useEffect(() => {
    if (status === "after") {
      window.location.reload();
    }
  }, [status]);

  function entrar(audioElemento) {
    setAudio(audioElemento);
    setAdentro(true);
  }

  return (
    <>
      <Particles />
      <div className="bg-glow bg-glow-1" aria-hidden="true" />
      <div className="bg-glow bg-glow-2" aria-hidden="true" />

      <AnimatePresence>
        {!adentro && <EntryScreen onEntrar={entrar} />}
      </AnimatePresence>

      {adentro && (
        <>
          {/* ANTES DE LA FIESTA */}
          {status === "before" && (
            <>
              <Hero />

              <div className="divider" aria-hidden="true">
                <div className="divider-diamond" />
              </div>

              <Countdown />

              <div className="divider" aria-hidden="true">
                <div className="divider-diamond" />
              </div>

              <Location />

              <div className="divider" aria-hidden="true">
                <div className="divider-diamond" />
              </div>

              <RSVP />
            </>
          )}

          {/* DURANTE LA FIESTA */}
          {status === "during" && (
            <>
              <section className="party-only-section" aria-label="La fiesta">
                <div className="party-only-badge">
                  <span className="party-only-dot" />
                  EN VIVO
                </div>
                <h1 className="party-only-title">
                  La fiesta
                  <br />
                  está en curso
                </h1>
                <p className="party-only-sub">Javier — 22 años</p>
              </section>

              <div className="divider" aria-hidden="true">
                <div className="divider-diamond" />
              </div>

              <Ruleta />

              <div className="divider" aria-hidden="true">
                <div className="divider-diamond" />
              </div>

              <Gallery />
            </>
          )}

          <footer className="footer">
            <p>Javier — 22 años</p>
          </footer>

          <MusicToggle audio={audio} />
        </>
      )}
    </>
  );
}

export default App;