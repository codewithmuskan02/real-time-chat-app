import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/AppToaster";

export const metadata: Metadata = {
  title: "Realtime Chat App",
  description: "Slack/Discord style realtime chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
