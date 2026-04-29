"use client";

import { useActionState, useEffect, useRef } from "react";

import { createEventAction } from "@/app/admin/events/actions";
import { initialActionState, type ActionState } from "@/app/admin/events/types";

const eventTypeOptions = [
  { value: "talk", label: "Fireside Chat" },
  { value: "hack", label: "Company Visit" },
  { value: "reading", label: "Major Event" },
  { value: "social", label: "Community Event" },
] as const;

const statuses = ["draft", "published", "past", "cancelled"] as const;

type Props = { disabled: boolean };

export function CreateEventForm({ disabled }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createEventAction,
    initialActionState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2 flex flex-col gap-1">
        <input
          name="title"
          required
          placeholder="Event title"
          aria-invalid={Boolean(fieldError("title"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("title") ? (
          <p className="text-xs text-red-600">{fieldError("title")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <input
          name="startsAt"
          required
          type="datetime-local"
          aria-invalid={Boolean(fieldError("startsAt"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("startsAt") ? (
          <p className="text-xs text-red-600">{fieldError("startsAt")}</p>
        ) : null}
      </div>

      <input
        name="location"
        placeholder="Location"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <select
        name="eventType"
        defaultValue="talk"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        {eventTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        name="status"
        defaultValue="draft"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <button
        disabled={disabled || pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {pending ? "Creating…" : "Create event"}
      </button>

      {state.error ? (
        <p role="alert" className="md:col-span-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="md:col-span-2 text-sm text-emerald-700">
          Event created.
        </p>
      ) : null}
    </form>
  );
}
