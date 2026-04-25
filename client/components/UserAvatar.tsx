"use client";

import Image from "next/image";
import clsx from "clsx";

interface Props {
  src?: string;
  name: string;
  online?: boolean;
}

export default function UserAvatar({ src, name, online }: Props) {
  return (
    <div className="relative h-9 w-9 shrink-0">
      {src ? (
        <Image src={src} alt={name} fill className="rounded-full object-cover" />
      ) : (
        <div className="h-9 w-9 rounded-full bg-zinc-700 text-xs text-white grid place-content-center">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span
        className={clsx(
          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-900",
          online ? "bg-emerald-500" : "bg-zinc-500"
        )}
      />
    </div>
  );
}
