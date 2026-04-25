"use client";

import { format } from "date-fns";
import clsx from "clsx";
import { Message } from "@/types";

interface Props {
  message: Message;
  mine: boolean;
}

export default function MessageBubble({ message, mine }: Props) {
  return (
    <div className={clsx("max-w-[80%] rounded-xl px-3 py-2", mine ? "ml-auto bg-blue-600" : "bg-zinc-800")}>
      {message.type === "image" && message.fileUrl && (
        <img src={message.fileUrl} alt="upload" className="mb-2 max-h-64 w-full rounded-lg object-cover" />
      )}
      {message.type === "file" && message.fileUrl && (
        <a href={message.fileUrl} target="_blank" className="underline text-sm" rel="noreferrer">
          {message.content || "Download file"}
        </a>
      )}
      {message.type === "text" && <p className="text-sm">{message.content}</p>}
      <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-zinc-300">
        <span>{format(new Date(message.createdAt), "HH:mm")}</span>
        {mine && <span>{message.readBy.length > 1 ? "✓✓" : "✓"}</span>}
      </div>
    </div>
  );
}
