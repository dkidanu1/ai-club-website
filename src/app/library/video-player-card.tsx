"use client";

import { useState } from "react";

import {
  getVideoEmbed,
  resolveLibraryItemThumbnail,
  type LibraryItemRecord,
} from "@/lib/library";

export function VideoPlayerCard({ item }: { item: LibraryItemRecord }) {
  const [playing, setPlaying] = useState(false);
  const embed = item.externalUrl ? getVideoEmbed(item.externalUrl) : null;
  const thumbnail = resolveLibraryItemThumbnail(item.imageUrl, item.externalUrl);

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      {embed && playing ? (
        <div className="aspect-video w-full">
          <iframe
            // Auto-play once the user clicks; the click is the user gesture
            // that browsers require to allow it.
            src={`${embed.embedUrl}${embed.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : embed ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${item.title}`}
          className="group relative block aspect-video w-full overflow-hidden bg-zinc-900"
        >
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover opacity-95 transition group-hover:opacity-100"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400">
              {embed.provider} video
            </div>
          )}
          <span
            className="absolute inset-0 grid place-items-center"
            aria-hidden
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-black/70 text-white shadow-lg transition group-hover:scale-110 group-hover:bg-brand-red">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-0.5 h-6 w-6"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      ) : (
        <div className="grid aspect-video w-full place-items-center bg-zinc-100 text-sm text-zinc-600">
          Video unavailable
          {item.externalUrl ? (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-zinc-700 hover:underline"
            >
              Open externally →
            </a>
          ) : null}
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium text-zinc-900">{item.title}</h3>
        {item.excerpt ? (
          <p className="mt-1 line-clamp-3 text-sm text-zinc-600">{item.excerpt}</p>
        ) : null}
        {item.tags.length > 0 ? (
          <p className="mt-2 text-[11px] text-zinc-500">
            {item.tags.map((t) => `#${t}`).join(" ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
