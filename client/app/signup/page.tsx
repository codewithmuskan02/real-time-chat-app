"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const loading = useAuthStore((s) => s.loading);
  const [form, setForm] = useState({ name: "", email: "", password: "", avatar: "" });

  return (
    <main className="grid min-h-screen place-content-center px-4">
      <form
        className="w-full min-w-80 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await signup(form);
          router.push("/chat");
        }}
      >
        <h1 className="text-xl font-semibold">Sign up</h1>
        <input className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <input className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Avatar URL (Cloudinary)" value={form.avatar} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} />
        <button disabled={loading} className="w-full rounded bg-blue-600 py-2">{loading ? "Loading..." : "Create account"}</button>
      </form>
    </main>
  );
}
