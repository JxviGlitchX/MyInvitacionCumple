const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

const ADMIN_PIN = "adminjavi123";

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS, "Content-Type": "application/json" },
    });
}

function error(msg, status = 500) {
    return json({ error: msg }, status);
}

function esVideo(base64) {
    return base64.startsWith("data:video/");
}

async function handleUpload(request, env) {
    try {
        const { image, userId } = await request.json();
        if (!image) return error("No hay archivo");

        const esVid = esVideo(image);
        const base64 = image.replace(/^data:[\w/]+;base64,/, "");
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        if (bytes.length > 50 * 1024 * 1024) {
            return error("Archivo muy grande", 400);
        }

        const extension = esVid ? "mp4" : "jpg";
        const contentType = esVid ? "video/mp4" : "image/jpeg";
        const key = `${esVid ? "videos" : "photos"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

        await env.BUCKET.put(key, bytes, {
            httpMetadata: { contentType },
            customMetadata: {
                uploadedBy: userId || "anon",
                date: new Date().toISOString(),
                mediaType: esVid ? "video" : "image",
            },
        });

        return json({ key, ok: true });
    } catch (err) {
        return error(err.message);
    }
}

async function handleListPhotos(request, env) {
    try {
        const listedPhotos = await env.BUCKET.list({
            prefix: "photos/",
            include: ["httpMetadata", "customMetadata"],
            limit: 500,
        });

        const listedVideos = await env.BUCKET.list({
            prefix: "videos/",
            include: ["httpMetadata", "customMetadata"],
            limit: 200,
        });

        const baseUrl = new URL(request.url).origin;

        const procesar = (objs) =>
            objs.map((obj) => ({
                id: obj.key,
                src: `${baseUrl}/api/photo/${obj.key}`,
                type: obj.customMetadata?.mediaType || "image",
                date: obj.customMetadata?.date || "",
                uploadedBy: obj.customMetadata?.uploadedBy || "",
            }));

        const todos = [...procesar(listedPhotos.objects), ...procesar(listedVideos.objects)].sort(
            (a, b) => (b.date || "").localeCompare(a.date || "")
        );

        return json(todos);
    } catch (err) {
        return error(err.message);
    }
}

async function handleGetPhoto(path, env) {
    try {
        const key = path.replace("/api/photo/", "");
        const object = await env.BUCKET.get(key);
        if (!object) return error("No encontrada", 404);

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("Cache-Control", "public, max-age=3600");
        headers.set("Access-Control-Allow-Origin", "*");

        return new Response(object.body, { headers });
    } catch (err) {
        return error(err.message);
    }
}

async function handleDeletePhoto(request, env) {
    try {
        const url = new URL(request.url);
        const pin = url.searchParams.get("pin");

        if (!pin || pin !== ADMIN_PIN) {
            return error("PIN incorrecto", 403);
        }

        const key = url.pathname.replace("/api/photo/", "");
        await env.BUCKET.delete(key);
        return json({ ok: true });
    } catch (err) {
        return error("Error: " + err.message);
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: CORS });
        }

        try {
            if (path === "/api/upload" && request.method === "POST")
                return handleUpload(request, env);
            if (path === "/api/photos" && request.method === "GET")
                return handleListPhotos(request, env);
            if (path.startsWith("/api/photo/") && request.method === "GET")
                return handleGetPhoto(path, env);
            if (path.startsWith("/api/photo/") && request.method === "DELETE")
                return handleDeletePhoto(request, env);
            return json({ status: "ok" });
        } catch (err) {
            return error(err.message);
        }
    },
};