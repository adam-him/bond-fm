export async function onRequestGet({ env }) {
  try {
    const listed = await env.BUCKET.list({ prefix: "audio/", include: ["customMetadata"] });

    const songs = listed.objects
      .filter(obj => obj.customMetadata?.title)
      .map(obj => ({
        id: obj.customMetadata.id,
        title: obj.customMetadata.title,
        uploader: obj.customMetadata.uploader || "Anonymous",
        uploadedAt: obj.customMetadata.uploadedAt,
        url: `/api/audio/${obj.key.replace("audio/", "")}`,
      }))
      .sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));

    return Response.json({ songs });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
