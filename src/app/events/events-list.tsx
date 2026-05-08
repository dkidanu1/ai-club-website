"use client";

import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/card";
import {
  EVENT_TYPE_LABELS,
  type EventRecord,
  type EventType,
} from "@/lib/events";

type Filter = "all" | EventType;

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "talk", label: EVENT_TYPE_LABELS.talk },
  { value: "hack", label: EVENT_TYPE_LABELS.hack },
  { value: "reading", label: EVENT_TYPE_LABELS.reading },
  { value: "social", label: EVENT_TYPE_LABELS.social },
];

function formatDateRange(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const end = endsAt
    ? ` – ${new Date(endsAt).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "";
  return `${start}${end}`;
}

function StatusBadge({ status }: { status: EventRecord["status"] }) {
  if (status === "cancelled") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        Cancelled
      </span>
    );
  }
  if (status === "past") {
    return (
      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
        Past
      </span>
    );
  }
  return null;
}

export function EventsList({
  upcoming,
  past,
}: {
  upcoming: EventRecord[];
  past: EventRecord[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredUpcoming =
    filter === "all" ? upcoming : upcoming.filter((e) => e.eventType === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-full border border-brand-red bg-brand-red px-3 py-1 text-sm font-medium text-white"
                  : "rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm hover:bg-zinc-100"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredUpcoming.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-600">
              {filter === "all"
                ? "No upcoming events scheduled."
                : `No upcoming ${EVENT_TYPE_LABELS[filter]} events.`}
            </p>
          </Card>
        ) : (
          filteredUpcoming.map((event) => (
            <Card key={event.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{event.title}</h2>
                    <StatusBadge status={event.status} />
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatDateRange(event.startsAt, event.endsAt)} · {event.location}
                  </p>
                  {event.guestName || event.guestCompany ? (
                    <p className="mt-1 text-sm font-medium text-zinc-700">
                      {[event.guestName, event.guestCompany]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {event.description ? (
                    <p className="mt-2 text-sm text-zinc-600">{event.description}</p>
                  ) : null}
                  <Link
                    href={`/events/${event.slug}`}
                    className="mt-3 inline-block text-xs font-medium text-zinc-700 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
                {event.rsvpUrl && event.status !== "cancelled" ? (
                  <a
                    href={event.rsvpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-fit shrink-0 items-center rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Register
                  </a>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>

      <Card title="Past events">
        {past.length === 0 ? (
          <p className="text-sm text-zinc-600">No past events yet.</p>
        ) : (
          <ul className="space-y-3">
            {past.map((event) => {
              const dateLabel = new Date(event.startsAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              );
              const guestLine = [event.guestName, event.guestCompany]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group flex gap-3 rounded-md border border-transparent p-2 hover:border-zinc-200 hover:bg-zinc-50"
                  >
                    {event.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.photoUrl}
                        alt={event.title}
                        className="h-16 w-16 shrink-0 rounded-md object-cover ring-1 ring-zinc-200"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-zinc-100 text-[11px] text-zinc-500 ring-1 ring-zinc-200">
                        No photo
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 group-hover:underline">
                        {event.title}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {dateLabel}
                        {guestLine ? ` · ${guestLine}` : ""}
                      </p>
                      {event.summary ? (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                          {event.summary}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
