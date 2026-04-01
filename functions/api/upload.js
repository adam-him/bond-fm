function uuid() {
  return crypto.randomUUID();
}

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const name = formData.get("name") || "Anonymous";

    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("audio/")) {
      return Response.json({ error: "Audio files only" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return Response.json({ error: "Max file size is 50MB" }, { status: 400 });
    }

    const id = uuid();
    const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
    const key = `audio/${id}.${ext}`;
    const safeTitle = file.name.replace(/[^\w.\- ]/g, "_");

    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
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
