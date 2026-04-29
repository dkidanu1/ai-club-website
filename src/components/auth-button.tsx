"use client";

import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthButtonProps = {
  isSignedIn: boolean;
  label?: string | null;
};

export function AuthButton({ isSignedIn, label }: AuthButtonProps) {
  const router = useRouter();

  const handleSignIn = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (isSignedIn) {
    return (
      <button
        onClick={handleSignOut}
        className="rounded-md border border-zinc-300 px-3 py-1.5"
      >
        Sign out{label ? ` (${label})` : ""}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded-md border border-zinc-300 px-3 py-1.5"
    >
      Sign in
    </button>
  );
}
