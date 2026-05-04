const API = "https://invitacion-javier.invitacion-javier.workers.dev";

function getUserId() {
  let id = sessionStorage.getItem("gallery-uid");
  if (!id) {
    id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    sessionStorage.setItem("gallery-uid", id);
  }
  return id;
}

async function hacerFetch(url, opciones) {
  try {
    const res = await fetch(url, opciones);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Worker no disponible");
    return { ok: false, error: true };
  }
}

export async function uploadPhoto(base64) {
  return hacerFetch(`${API}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, userId: getUserId() }),
  });
}

export async function uploadVideo(base64) {
  return hacerFetch(`${API}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, userId: getUserId() }),
  });
}

export async function getPhotos() {
  try {
    const res = await fetch(`${API}/api/photos`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function deletePhoto(key, pin) {
  try {
    const res = await fetch(`${API}/api/photo/${key}?pin=${encodeURIComponent(pin)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Error al eliminar");
    }
    return await res.json();
  } catch (err) {
    if (err.message.includes("PIN") || err.message.includes("incorrecto")) throw err;
    console.warn("Worker no disponible");
    return { ok: false, error: true };
  }
}