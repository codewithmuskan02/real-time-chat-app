"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import { useAuthStore } from "@/store/auth";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, restore, logout } = useAuthStore();

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    if (!token && pathname.startsWith("/chat")) router.replace("/login");
  }, [token, pathname, router]);

  return (
    <main className="h-screen md:flex">
      <Sidebar />
      <section className="flex h-full flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 p-3">
          <h1 className="text-sm font-semibold">Realtime Chat</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button className="rounded bg-zinc-800 px-3 py-1 text-sm" onClick={() => void logout()}>
              Logout
            </button>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
