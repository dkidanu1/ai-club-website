import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { getCurrentMember } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stanford GSB AI Club",
  description: "Public website and back office for Stanford GSB AI Club.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const member = await getCurrentMember();
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/library", label: "Library" },
    { href: "/perks", label: "Perks" },
    { href: "/about", label: "About" },
  ];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              AI Club
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              ))}
              <AuthButton
                isSignedIn={Boolean(member)}
                label={member?.full_name?.split(" ")[0] ?? null}
              />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 AI Club</p>
            <p>hello@aiclub · discord.gg/aiclub · @stanford.aiclub</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
