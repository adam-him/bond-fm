"use client";

import { useState, useEffect, useRef } from "react";

interface Song {
  id: string;
  title: string;
  uploader: string;
  url: string;
  uploadedAt: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      setSongs(data.songs || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setSelectedFile(file);
      setUploadError("");
    } else {
      setUploadError("Please drop an audio file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Pick a file first.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const form = new FormData();
    form.append("file", selectedFile);
    form.append("name", name.trim() || "Anonymous");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      setUploadSuccess("Track uploaded.");
      setSelectedFile(null);
      setName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSongs();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          BOND FM
        </h1>
        <p className="text-gray-500 mt-1 text-sm">upload. listen. repeat.</p>
      </div>

      {/* Upload Section */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
          Drop a track
        </h2>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-purple-500 bg-purple-500/10"
              : selectedFile
              ? "border-purple-700 bg-purple-900/10"
              : "border-gray-800 hover:border-gray-600"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {selectedFile ? (
            <div>
              <p className="text-purple-400 font-medium">{selectedFile.name}</p>
              <p className="text-gray-600 text-xs mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-sm">
                drag & drop an audio file, or click to browse
              </p>
            </div>
          )}
        </div>

        {/* Name input */}
        <input
          type="text"
          placeholder="your name (optional — leave blank for anonymous)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-3 w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
        />

        {uploadError && (
          <p className="text-red-400 text-xs mt-2">{uploadError}</p>
        )}
        {uploadSuccess && (
          <p className="text-purple-400 text-xs mt-2">{uploadSuccess}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="mt-3 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {uploading ? "uploading..." : "upload track"}
        </button>
      </section>

      {/* Song List */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
          On air
        </h2>

        {loading ? (
          <p className="text-gray-600 text-sm">loading...</p>
        ) : songs.length === 0 ? (
          <p className="text-gray-600 text-sm">
            nothing here yet. be the first to upload.
          </p>
        ) : (
          <div className="space-y-4">
            {[...songs].reverse().map((song) => (
              <div
                key={song.id}
                className="bg-[#111] border border-gray-800/60 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium text-sm leading-tight">
                      {song.title}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {song.uploader} · {formatTime(song.uploadedAt)}
                    </p>
                  </div>
                </div>
                <audio controls preload="none" className="w-full h-8">
                  <source src={song.url} />
                </audio>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
