"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createArticleItemAction,
  createVideoItemAction,
  deleteLibraryItemAction,
  refetchArticleOgAction,
  updateLibraryItemAction,
  updateLibraryItemStatusAction,
} from "@/app/admin/library/actions";
import { initialActionState, type ActionState } from "@/app/admin/library/types";
import type { LibraryItemRecord } from "@/lib/library";

type Disabled = { disabled: boolean };

export function CreateArticleForm({ disabled }: Disabled) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createArticleItemAction,
    initialActionState
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form ref={ref} action={action} className="grid gap-2 md:grid-cols-2">
      <div className="md:col-span-2 flex flex-col gap-1">
        <input
          name="externalUrl"
          required
          placeholder="Article URL (https://...)"
          aria-invalid={Boolean(fieldError("externalUrl"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("externalUrl") ? (
          <p className="text-xs text-red-600">{fieldError("externalUrl")}</p>
        ) : null}
        <p className="text-[11px] text-zinc-500">
          On submit, we&apos;ll fetch the page and pull the OG image, title, and
          description automatically.
        </p>
      </div>

      <input
        name="title"
        placeholder="Title (auto-filled from page if blank)"
        disabled={disabled || pending}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="sourceName"
        placeholder="Source name (e.g. Wired)"
        disabled={disabled || pending}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="tags"
        placeholder="tags, comma, separated"
        disabled={disabled || pending}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <textarea
        name="excerpt"
        rows={2}
        placeholder="Excerpt (auto-filled from page if blank)"
        disabled={disabled || pending}
        className="md:col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <button
        disabled={disabled || pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Fetching…" : "Add article"}
      </button>

      {state.error ? (
        <p role="alert" className="md:col-span-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="md:col-span-2 text-sm text-emerald-700">
          Article added (drafted). Mark it published below.
        </p>
      ) : null}
    </form>
  );
}

export function CreateVideoForm({ disabled }: Disabled) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createVideoItemAction,
    initialActionState
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form ref={ref} action={action} className="grid gap-2 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <input
          name="title"
          required
          placeholder="Title"
          disabled={disabled || pending}
          aria-invalid={Boolean(fieldError("title"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("title") ? (
          <p className="text-xs text-red-600">{fieldError("title")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <input
          name="externalUrl"
          required
          placeholder="YouTube, Vimeo, or Loom URL"
          disabled={disabled || pending}
          aria-invalid={Boolean(fieldError("externalUrl"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("externalUrl") ? (
          <p className="text-xs text-red-600">{fieldError("externalUrl")}</p>
        ) : null}
      </div>

      <input
        name="tags"
        placeholder="tags, comma, separated"
        disabled={disabled || pending}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <textarea
        name="excerpt"
        rows={2}
        placeholder="Short caption (optional)"
        disabled={disabled || pending}
        className="md:col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <button
        disabled={disabled || pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add video"}
      </button>

      {state.error ? (
        <p role="alert" className="md:col-span-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="md:col-span-2 text-sm text-emerald-700">
          Video added (drafted). Mark it published below.
        </p>
      ) : null}
    </form>
  );
}

export function LibraryItemRow({
  item,
  disabled,
}: {
  item: LibraryItemRecord;
  disabled: boolean;
}) {
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(
    updateLibraryItemStatusAction,
    initialActionState
  );
  const [editState, editAction, editPending] = useActionState<ActionState, FormData>(
    updateLibraryItemAction,
    initialActionState
  );
  const [refetchState, refetchAction, refetchPending] = useActionState<ActionState, FormData>(
    refetchArticleOgAction,
    initialActionState
  );
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState, FormData>(
    deleteLibraryItemAction,
    initialActionState
  );

  const fieldError = (name: string) => editState.fieldErrors?.[name];

  // Re-mount the edit form whenever the saved item changes so React's form
  // reset can't snap inputs back to stale defaultValue props.
  const editFormKey = `${item.id}|${item.title}|${item.externalUrl ?? ""}|${item.imageUrl ?? ""}|${item.sourceName ?? ""}|${item.excerpt}|${item.tags.join(",")}`;

  return (
    <div className="rounded-md border border-zinc-200 p-3 text-sm">
      <div className="flex gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-14 w-20 shrink-0 rounded object-cover ring-1 ring-zinc-200"
          />
        ) : (
          <div className="grid h-14 w-20 shrink-0 place-items-center rounded bg-zinc-100 text-[11px] text-zinc-500 ring-1 ring-zinc-200">
            {item.type === "video" ? "▶" : "No img"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900">
            <span className="mr-1 text-xs uppercase tracking-wider text-zinc-500">
              {item.type}
            </span>
            {item.title}
          </p>
          <p className="text-xs text-zinc-600">
            {item.status} · {item.tags.join(", ") || "no tags"}
            {item.sourceName ? ` · ${item.sourceName}` : ""}
          </p>
          {item.externalUrl ? (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-xs text-zinc-700 hover:underline"
            >
              {item.externalUrl}
            </a>
          ) : null}
        </div>
      </div>

      <form action={statusAction} className="mt-2 flex items-center gap-2">
        <input type="hidden" name="id" value={item.id} />
        <select
          name="status"
          defaultValue={item.status}
          disabled={disabled || statusPending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
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

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-zinc-700 hover:underline">
          Edit details
        </summary>
        <form
          key={editFormKey}
          action={editAction}
          className="mt-2 grid gap-2 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="type" value={item.type} />

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[11px] font-medium text-zinc-600">Title</label>
            <input
              name="title"
              required
              defaultValue={item.title}
              disabled={disabled || editPending}
              aria-invalid={Boolean(fieldError("title"))}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
            />
            {fieldError("title") ? (
              <p className="text-[11px] text-red-600">{fieldError("title")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[11px] font-medium text-zinc-600">
              {item.type === "video" ? "Video URL" : "Article URL"}
            </label>
            <input
              name="externalUrl"
              required
              defaultValue={item.externalUrl ?? ""}
              disabled={disabled || editPending}
              aria-invalid={Boolean(fieldError("externalUrl"))}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
            />
            {fieldError("externalUrl") ? (
              <p className="text-[11px] text-red-600">{fieldError("externalUrl")}</p>
            ) : null}
          </div>

          {item.type === "article" ? (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-medium text-zinc-600">
                Image URL (auto-fetched from page; override if needed)
              </label>
              <input
                name="imageUrl"
                defaultValue={item.imageUrl ?? ""}
                disabled={disabled || editPending}
                aria-invalid={Boolean(fieldError("imageUrl"))}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
              />
              {fieldError("imageUrl") ? (
                <p className="text-[11px] text-red-600">{fieldError("imageUrl")}</p>
              ) : null}
            </div>
          ) : (
            <input type="hidden" name="imageUrl" value={item.imageUrl ?? ""} />
          )}

          <input
            name="sourceName"
            placeholder="Source name"
            defaultValue={item.sourceName ?? ""}
            disabled={disabled || editPending}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
          />
          <input
            name="tags"
            placeholder="tags, comma, separated"
            defaultValue={item.tags.join(", ")}
            disabled={disabled || editPending}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
          />

          <textarea
            name="excerpt"
            rows={2}
            placeholder="Excerpt"
            defaultValue={item.excerpt}
            disabled={disabled || editPending}
            className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
          />

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              disabled={disabled || editPending}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              {editPending ? "Saving…" : "Save details"}
            </button>
            {editState.error ? (
              <p role="alert" className="text-xs text-red-600">
                {editState.error}
              </p>
            ) : null}
            {editState.ok ? (
              <p role="status" className="text-xs text-emerald-700">
                Saved
              </p>
            ) : null}
          </div>
        </form>

        {item.type === "article" && item.externalUrl ? (
          <form action={refetchAction} className="mt-2 flex items-center gap-2">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="externalUrl" value={item.externalUrl} />
            <button
              disabled={disabled || refetchPending}
              className="text-xs font-medium text-zinc-700 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              {refetchPending ? "Re-fetching…" : "Re-fetch image from URL"}
            </button>
            {refetchState.error ? (
              <span role="alert" className="text-xs text-red-600">
                {refetchState.error}
              </span>
            ) : null}
            {refetchState.ok ? (
              <span role="status" className="text-xs text-emerald-700">
                Image updated
              </span>
            ) : null}
          </form>
        ) : null}
      </details>

      <form
        action={deleteAction}
        className="mt-2 flex items-center gap-2"
        onSubmit={(e) => {
          if (!confirm(`Delete "${item.title}"? This can't be undone.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={item.id} />
        <button
          disabled={disabled || deletePending}
          className="text-xs font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          {deletePending ? "Deleting…" : "Delete"}
        </button>
        {deleteState.error ? (
          <span role="alert" className="text-xs text-red-600">
            {deleteState.error}
          </span>
        ) : null}
      </form>
    </div>
  );
}
