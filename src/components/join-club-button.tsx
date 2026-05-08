"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  isSignedIn: boolean;
  authEnabled: boolean;
};

export function JoinClubButton({ isSignedIn, authEnabled }: Props) {
  const [pending, setPending] = useState(false);

  if (isSignedIn) {
    return (
      <span className="rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
        You&apos;re a member
      </span>
    );
  }

  const handleJoin = async () => {
    if (!authEnabled) return;
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2F`,
          queryParams: { hd: "stanford.edu", prompt: "select_account" },
        },
      });
      if (error) {
        console.error("Join failed:", error);
        setPending(false);
      }
    } catch (err) {
      console.error("Join error:", err);
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={pending || !authEnabled}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Redirecting…" : "Join the club"}
    </button>
  );
}
