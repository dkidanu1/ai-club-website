"use client";

import { useActionState } from "react";

import {
  deleteEventAction,
  updateEventDetailsAction,
  updateEventStatusAction,
} from "@/app/admin/events/actions";
import { initialActionState, type ActionState } from "@/app/admin/events/types";
import { PhotoUploader } from "@/components/photo-uploader";
import type { AdminEventRecord } from "@/lib/supabase/server";

const eventTypeOptions = [
  { value: "talk", label: "Fireside Chat" },
  { value: "hack", label: "Company Visit" },
  { value: "reading", label: "Major Event" },
  { value: "social", label: "Community Event" },
] as const;

const statuses = ["draft", "published", "past", "cancelled"] as const;

function toLocalDateTimeValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Convert to a local datetime-local string (YYYY-MM-DDTHH:MM).
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState, FormData>(
    deleteEventAction,
    initialActionState
  );

  const fieldError = (name: string) => detailsState.fieldErrors?.[name];

  // Re-mount the details form whenever the persisted event data changes.
  // Without this, React 19's form auto-reset can snap inputs back to a
  // stale defaultValue right after a successful save, making it look like
  // edits were wiped.
  const detailsFormKey = `${event.id}|${event.title}|${event.startsAt}|${event.endsAt ?? ""}|${event.location}|${event.eventType}|${event.guestName ?? ""}|${event.guestCompany ?? ""}|${event.rsvpUrl ?? ""}|${event.description}|${event.summary ?? ""}|${event.photoUrl ?? ""}|${event.galleryUrls.join("|")}|${event.transcript ?? ""}`;
  const errorCount = detailsState.fieldErrors
    ? Object.keys(detailsState.fieldErrors).length
    : 0;

  const statusStyles: Record<typeof event.status, string> = {
    draft: "bg-amber-100 text-amber-800",
    published: "bg-emerald-100 text-emerald-800",
    past: "bg-zinc-200 text-zinc-700",
    cancelled: "bg-red-100 text-red-800",
  };

  const dateLabel = `${new Date(event.startsAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}${
    event.endsAt
      ? ` – ${new Date(event.endsAt).toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`
      : ""
  }`;

  return (
    <details className="group rounded-md border border-zinc-200 text-sm text-zinc-700 open:bg-white">
      <summary className="flex flex-wrap items-center gap-2 p-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="font-medium text-zinc-900">{event.title}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[event.status]}`}
        >
          {event.status}
        </span>
        <span className="text-xs text-zinc-600">{dateLabel}</span>
        <span
          aria-hidden
          className="ml-auto text-xs text-zinc-500 transition-transform group-open:rotate-90"
        >
          ▶
        </span>
      </summary>

      <div className="border-t border-zinc-200 p-3">
        <form action={statusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={event.id} />
          <label className="text-[11px] font-medium text-zinc-600">Status:</label>
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

        <form
          key={detailsFormKey}
          action={detailsAction}
          className="mt-4 grid gap-2 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={event.id} />
          {errorCount > 0 ? (
            <p
              role="alert"
              className="md:col-span-2 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-800"
            >
              {errorCount} field
              {errorCount === 1 ? "" : "s"} need attention before saving — see the
              red messages below.
            </p>
          ) : null}

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[11px] font-medium text-zinc-600">Title</label>
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
            <label className="text-[11px] font-medium text-zinc-600">Start time</label>
            <input
              name="startsAt"
              required
              type="datetime-local"
              defaultValue={toLocalDateTimeValue(event.startsAt)}
              disabled={disabled || detailsPending}
              aria-invalid={Boolean(fieldError("startsAt"))}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
            />
            {fieldError("startsAt") ? (
              <p className="text-[11px] text-red-600">{fieldError("startsAt")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-600">End time (optional)</label>
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={toLocalDateTimeValue(event.endsAt)}
              disabled={disabled || detailsPending}
              aria-invalid={Boolean(fieldError("endsAt"))}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
            />
            {fieldError("endsAt") ? (
              <p className="text-[11px] text-red-600">{fieldError("endsAt")}</p>
            ) : null}
          </div>

          <input
            name="location"
            placeholder="Location"
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

          <input
            name="guestName"
            placeholder="Guest name (e.g. Dr. Fei-Fei Li)"
            defaultValue={event.guestName ?? ""}
            disabled={disabled || detailsPending}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
          />

          <input
            name="guestCompany"
            placeholder="Guest company (e.g. Stanford HAI)"
            defaultValue={event.guestCompany ?? ""}
            disabled={disabled || detailsPending}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
          />

          <input
            name="rsvpUrl"
            placeholder="RSVP URL"
            defaultValue={event.rsvpUrl ?? ""}
            disabled={disabled || detailsPending}
            className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
          />

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-600">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Event description (shown on upcoming event cards)"
              defaultValue={event.description}
              disabled={disabled || detailsPending}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-600">
              Past-event summary (recap of how the event went)
            </label>
            <textarea
              name="summary"
              rows={3}
              placeholder="Once the event happens, write a short recap here. Shown on the past events listing."
              defaultValue={event.summary ?? ""}
              disabled={disabled || detailsPending}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-600">
              Hero photo (single image, shown at the top of the detail page)
            </label>
            <PhotoUploader inputName="photoUrl" defaultValue={event.photoUrl ?? ""} />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-600">
              Additional photos (gallery on the detail page — upload or paste URLs)
            </label>
            <PhotoUploader
              inputName="galleryUrls"
              defaultValue={event.galleryUrls.join("\n")}
              multiple
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-zinc-600">
              Transcript (full text — for past events; appears on detail page)
            </label>
            <textarea
              name="transcript"
              rows={6}
              placeholder="Paste the full transcript here once the event has happened."
              defaultValue={event.transcript ?? ""}
              disabled={disabled || detailsPending}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
            />
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

        <form
          action={deleteAction}
          className="mt-3 flex items-center gap-3"
          onSubmit={(e) => {
            if (
              !confirm(`Delete "${event.title}"? This cannot be undone.`)
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={event.id} />
          <button
            disabled={disabled || deletePending}
            className="text-xs font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            {deletePending ? "Deleting…" : "Delete event"}
          </button>
          {deleteState.error ? (
            <p role="alert" className="text-xs text-red-600">
              {deleteState.error}
            </p>
          ) : null}
        </form>
      </div>
    </details>
  );
}
