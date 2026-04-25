"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="grid min-h-screen place-content-center px-4">
      <form
        className="w-full min-w-80 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await login(email, password);
          router.push("/chat");
        }}
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded bg-blue-600 py-2">{loading ? "Loading..." : "Login"}</button>
      </form>
    </main>
  );
}
