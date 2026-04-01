import { list, put, del } from "@vercel/blob";

export interface Song {
  id: string;
  title: string;
  uploader: string;
  url: string;
  uploadedAt: string;
}

export interface Metadata {
  songs: Song[];
}

const METADATA_PATH = "bond-fm-metadata.json";

export async function getMetadata(): Promise<Metadata> {
  try {
    const { blobs } = await list({ prefix: "bond-fm-metadata" });
    const metaBlob = blobs.find((b) => b.pathname === METADATA_PATH);
    if (!metaBlob) return { songs: [] };
    const res = await fetch(metaBlob.url, { cache: "no-store" });
    return await res.json();
  } catch {
    return { songs: [] };
  }
}

export async function saveMetadata(metadata: Metadata): Promise<void> {
  // Delete existing metadata blob
  try {
    const { blobs } = await list({ prefix: "bond-fm-metadata" });
    const existing = blobs.filter((b) => b.pathname === METADATA_PATH);
    if (existing.length > 0) {
      await del(existing.map((b) => b.url));
    }
  } catch {
    // ignore
  }

  await put(METADATA_PATH, JSON.stringify(metadata), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}
