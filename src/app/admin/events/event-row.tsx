"use client";

import { useActionState } from "react";

import {
  updateEventDetailsAction,
  updateEventStatusAction,
} from "@/app/admin/events/actions";
import { initialActionState, type ActionState } from "@/app/admin/events/types";
import type { AdminEventRecord } from "@/lib/supabase/server";

const eventTypeOptions = [
  { value: "talk", label: "Fireside Chat" },
  { value: "hack", label: "Company Visit" },
  { value: "reading", label: "Major Event" },
  { value: "social", label: "Community Event" },
] as const;

const statuses = ["draft", "published", "past", "cancelled"] as const;

type Props = { event: AdminEventRecord; disabled: boolean };

export function EventRow({ event, disabled }: Props) {
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(
    updateEventStatusAction,
    initialActionState
  );
  const [detailsState, detailsAction, detailsPending] = useActionState<ActionState, FormData>(
    updateEventDetailsAction,
    initialActionState
  );

  const fieldError = (name: string) => detailsState.fieldErrors?.[name];

  return (
    <div className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
      <p className="font-medium">{event.title}</p>
      <p className="text-zinc-600">
        {new Date(event.startsAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}{" "}
        · {event.location} · {event.rsvpCount}
        {event.capacity ? `/${event.capacity}` : ""} RSVPs
      </p>

      <form action={statusAction} className="mt-2 flex items-center gap-2">
        <input type="hidden" name="id" value={event.id} />
        <select
          name="status"
          defaultValue={event.status}
          disabled={disabled || statusPending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          disabled={disabled || statusPending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          {statusPending ? "Saving…" : "Update status"}
        </button>
        {statusState.error ? (
          <span role="alert" className="text-xs text-red-600">
            {statusState.error}
          </span>
        ) : null}
        {statusState.ok ? (
          <span role="status" className="text-xs text-emerald-700">
            Saved
          </span>
        ) : null}
      </form>

      <form action={detailsAction} className="mt-3 grid gap-2 md:grid-cols-2">
        <input type="hidden" name="id" value={event.id} />

        <div className="flex flex-col gap-1">
          <input
            name="title"
            required
            defaultValue={event.title}
            disabled={disabled || detailsPending}
            aria-invalid={Boolean(fieldError("title"))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("title") ? (
            <p className="text-[11px] text-red-600">{fieldError("title")}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <input
            name="startsAt"
            required
            type="datetime-local"
            defaultValue={new Date(event.startsAt).toISOString().slice(0, 16)}
            disabled={disabled || detailsPending}
            aria-invalid={Boolean(fieldError("startsAt"))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("startsAt") ? (
            <p className="text-[11px] text-red-600">{fieldError("startsAt")}</p>
          ) : null}
        </div>

        <input
          name="location"
          defaultValue={event.location}
          disabled={disabled || detailsPending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        />

        <select
          name="eventType"
          defaultValue={event.eventType}
          disabled={disabled || detailsPending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        >
          {eventTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-1">
          <input
            name="rsvpCount"
            type="number"
            min={0}
            defaultValue={event.rsvpCount}
            disabled={disabled || detailsPending}
            aria-invalid={Boolean(fieldError("rsvpCount"))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("rsvpCount") ? (
            <p className="text-[11px] text-red-600">{fieldError("rsvpCount")}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <input
            name="capacity"
            type="number"
            min={0}
            defaultValue={event.capacity ?? ""}
            disabled={disabled || detailsPending}
            aria-invalid={Boolean(fieldError("capacity"))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("capacity") ? (
            <p className="text-[11px] text-red-600">{fieldError("capacity")}</p>
          ) : null}
        </div>

        <input
          name="rsvpUrl"
          placeholder="RSVP URL"
          defaultValue={event.rsvpUrl ?? ""}
          disabled={disabled || detailsPending}
          className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        />

        <textarea
          name="description"
          rows={3}
          placeholder="Event description"
          defaultValue={event.description}
          disabled={disabled || detailsPending}
          className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        />

        <div className="md:col-span-2 flex flex-col gap-1">
          <textarea
            name="agendaJson"
            rows={4}
            defaultValue={JSON.stringify(event.agenda, null, 2)}
            disabled={disabled || detailsPending}
            aria-invalid={Boolean(fieldError("agendaJson"))}
            className="rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("agendaJson") ? (
            <p className="text-[11px] text-red-600">{fieldError("agendaJson")}</p>
          ) : null}
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            disabled={disabled || detailsPending}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            {detailsPending ? "Saving…" : "Save details"}
          </button>
          {detailsState.error ? (
            <p role="alert" className="text-xs text-red-600">
              {detailsState.error}
            </p>
          ) : null}
          {detailsState.ok ? (
            <p role="status" className="text-xs text-emerald-700">
              Saved
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
