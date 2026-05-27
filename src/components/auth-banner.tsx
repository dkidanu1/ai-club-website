"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  domain:
    "Sign-in is restricted to @stanford.edu accounts. You've been signed out.",
  not_officer:
    "Your account isn't an officer or president. Ask club leadership to upgrade your role.",
  oauth: "Google sign-in didn't complete. Please try again.",
  missing_code: "Sign-in didn't return a code. Please try again.",
  no_email: "Google didn't return an email for that account. Try a different account.",
  not_configured: "Authentication isn't configured on the server.",
};

export function AuthBanner() {
  const params = useSearchParams();
  const error = params.get("auth_error");
  const required = params.get("auth_required");

  if (!error && !required) return null;

  if (required) {
    return (
      <div
        role="status"
        className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Please sign in with your @stanford.edu account to continue.
      </div>
    );
  }

  const message = (error && ERROR_MESSAGES[error]) || "Something went wrong signing in.";
  return (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
    >
      {message}
    </div>
  );
}
