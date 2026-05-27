"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthButtonProps = {
  isSignedIn: boolean;
  label?: string | null;
  authEnabled: boolean;
};

export function AuthButton({ isSignedIn, label, authEnabled }: AuthButtonProps) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  const handleSignIn = async () => {
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const next = encodeURIComponent(pathname || "/");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
          queryParams: { hd: "stanford.edu", prompt: "select_account" },
        },
      });
      if (error) {
        console.error("Sign-in failed:", error);
        setPending(false);
      }
      // On success the browser is redirected to Google; no need to clear pending.
    } catch (err) {
      console.error("Sign-in error:", err);
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      // Hard reload so all server-rendered data is re-fetched without auth.
      window.location.href = "/";
    }
  };

  if (isSignedIn) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing out…" : `Sign out${label ? ` (${label})` : ""}`}
      </button>
    );
  }

  if (!authEnabled) {
    return (
      <span className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-zinc-600">
        Dev mode
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={pending}
      className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Redirecting…" : "Sign in"}
    </button>
  );
}
