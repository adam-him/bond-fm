function uuid() {
  return crypto.randomUUID();
}

export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") || "Anonymous";
    const trackName = url.searchParams.get("trackName") || "";
    const filename = url.searchParams.get("filename") || "track";
    const contentType = url.searchParams.get("type") || request.headers.get("content-type") || "audio/mpeg";

    if (!contentType.startsWith("audio/")) {
      return Response.json({ error: "Audio files only" }, { status: 400 });
    }

    const body = request.body;
    if (!body) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const id = uuid();
    const ext = (filename.split(".").pop() || "mp3").toLowerCase();
    const key = `audio/${id}.${ext}`;
    const safeTitle = trackName.trim() || filename.replace(/[^\w.\- ]/g, "_");

    await env.BUCKET.put(key, body, {
      httpMetadata: { contentType },
      customMetadata: {
        id,
        title: safeTitle,
        uploader: String(name).trim() || "Anonymous",
        uploadedAt: new Date().toISOString(),
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
