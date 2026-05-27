import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";

import { AuthBanner } from "@/components/auth-banner";
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
  const authEnabled = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === "true";
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
      <body
        className="min-h-full flex flex-col bg-zinc-50 text-zinc-900"
        suppressHydrationWarning
      >
        <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-brand-vintage"
            >
              Stanford GSB AI Club
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-700">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-brand-dusty"
                >
                  {item.label}
                </Link>
              ))}
              <AuthButton
                isSignedIn={Boolean(member)}
                label={member?.full_name?.split(" ")[0] ?? null}
                authEnabled={authEnabled}
              />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-12 sm:py-16">
          <Suspense fallback={null}>
            <AuthBanner />
          </Suspense>
          {children}
        </main>
        <footer className="border-t border-zinc-200/70 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Stanford GSB AI Club</p>
            <p>hello@aiclub · discord.gg/aiclub · @stanford.aiclub</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
