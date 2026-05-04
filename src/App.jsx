import { useState } from "react";
import Particles from "./components/ui/Particles";
import MusicToggle from "./components/ui/MusicToggle";
import EntryScreen from "./components/ui/EntryScreen";
import Hero from "./components/sections/Hero";
import Countdown from "./components/sections/Countdown";
import Location from "./components/sections/Location";
import RSVP from "./components/sections/RSVP";

function App() {
  const [adentro, setAdentro] = useState(false);
  const [audio, setAudio] = useState(null);

  function entrar(audioRef) {
    setAudio(audioRef);
    setAdentro(true);
  }

  return (
    <>
      <Particles />
      <div className="bg-glow bg-glow-1" aria-hidden="true" />
      <div className="bg-glow bg-glow-2" aria-hidden="true" />

      {/* Pantalla de entrada — se quita al tocar */}
      {!adentro && <EntryScreen onEntrar={entrar} />}

      {/* Contenido principal — solo se monta después de entrar */}
      {adentro && (
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

          <footer className="footer">
            <p>Javier — 22 años</p>
          </footer>


        </>
      )}
    </>
  );
}

export default App;