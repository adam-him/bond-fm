export async function onRequestGet({ params, env, request }) {
  const key = `audio/${params.id}`;

  const obj = await env.BUCKET.get(key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");

  // Handle range requests for audio seeking
  const range = request.headers.get("range");
  if (range) {
    const size = obj.size;
    const [startStr, endStr] = range.replace("bytes=", "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : size - 1;
    headers.set("content-range", `bytes ${start}-${end}/${size}`);
    headers.set("content-length", String(end - start + 1));
    return new Response(obj.body, { status: 206, headers });
  }

  if (obj.size) headers.set("content-length", String(obj.size));
  return new Response(obj.body, { status: 200, headers });
}
