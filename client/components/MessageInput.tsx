"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  onSend: (payload: { content: string; type: "text" | "image" | "file"; fileUrl?: string }) => void;
}

export default function MessageInput({ onSend }: Props) {
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const { data: sig } = await api.post("/api/upload");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const uploaded = await cloudinaryRes.json();
      const isImage = file.type.startsWith("image/");
      onSend({
        content: isImage ? "" : file.name,
        type: isImage ? "image" : "file",
        fileUrl: uploaded.secure_url,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t border-zinc-800 p-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!content.trim()) return;
          onSend({ content, type: "text" });
          setContent("");
        }}
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none"
        />
        <label className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-xs">
          {uploading ? "Uploading..." : "File"}
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium">Send</button>
      </form>
    </div>
  );
}
