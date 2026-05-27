"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import type { AttentionItem } from "@/lib/supabase/server";

const STORAGE_KEY = "admin:dismissed_attention";

// In-memory pub/sub backed by localStorage, so useSyncExternalStore can
// subscribe to changes from this tab (the native `storage` event only
// fires for other tabs).
const listeners = new Set<() => void>();

function read(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function write(value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {}
  for (const fn of listeners) fn();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const crossTab = () => cb();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", crossTab);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", crossTab);
    }
  };
}

function parseDismissed(raw: string): Set<string> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === "string"));
    }
  } catch {}
  return new Set();
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  // Server snapshot is "[]" so SSR renders the full unfiltered list. After
  // hydration, the client reads localStorage and re-renders with dismissed
  // items removed.
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const dismissed = useMemo(() => parseDismissed(raw), [raw]);

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    write(JSON.stringify(Array.from(next)));
  };

  const restoreAll = () => write("[]");

  const visible = items.filter((i) => !dismissed.has(i.id));
  const dismissedCount = items.length - visible.length;

  if (visible.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {items.length === 0
            ? "All clear — nothing needs your attention right now."
            : "All caught up. Nice."}
        </p>
        {dismissedCount > 0 ? (
          <button
            type="button"
            onClick={restoreAll}
            className="text-xs font-medium text-brand-dusty hover:underline"
          >
            Restore {dismissedCount} dismissed
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2 text-sm">
        {visible.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <input
              id={`attn-${item.id}`}
              type="checkbox"
              checked={false}
              onChange={() => dismiss(item.id)}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-zinc-300 accent-brand-vintage"
              aria-label={`Dismiss: ${item.text}`}
            />
            <label htmlFor={`attn-${item.id}`} className="flex-1 cursor-pointer">
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-700 hover:text-brand-dusty hover:underline"
                >
                  {item.text}
                </Link>
              ) : (
                <span className="text-zinc-700">{item.text}</span>
              )}
            </label>
          </li>
        ))}
      </ul>
      {dismissedCount > 0 ? (
        <button
          type="button"
          onClick={restoreAll}
          className="text-xs font-medium text-brand-dusty hover:underline"
        >
          Restore {dismissedCount} dismissed
        </button>
      ) : null}
    </div>
  );
}
