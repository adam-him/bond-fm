import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getMetadata, saveMetadata } from "@/lib/metadata";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null) || "Anonymous";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be an audio file" },
        { status: 400 }
      );
    }

    // Limit file size to 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const ext = file.name.split(".").pop() || "mp3";
    const safeTitle = file.name.replace(/[^a-zA-Z0-9._\- ]/g, "_");
    const blobPath = `songs/${id}.${ext}`;

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    const metadata = await getMetadata();
    metadata.songs.push({
      id,
      title: safeTitle,
      uploader: name.trim() || "Anonymous",
      url: blob.url,
      uploadedAt: new Date().toISOString(),
    });

    await saveMetadata(metadata);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
