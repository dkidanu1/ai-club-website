"use client";

import { useActionState } from "react";

import {
  deleteMemberAction,
  updateMemberAction,
} from "@/app/admin/members/actions";
import { initialActionState, type ActionState } from "@/app/admin/members/types";
import type { AdminMemberRecord } from "@/lib/supabase/server";

const ROLES = ["member", "officer", "president"] as const;

type Props = { member: AdminMemberRecord; disabled: boolean };

export function MemberRow({ member, disabled }: Props) {
  const [updateState, updateAction, updatePending] = useActionState<ActionState, FormData>(
    updateMemberAction,
    initialActionState
  );
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState, FormData>(
    deleteMemberAction,
    initialActionState
  );

  const fieldError = (name: string) => updateState.fieldErrors?.[name];

  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <div className="mb-2 flex items-center gap-3">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.fullName || member.email}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200"
          />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
            {(member.fullName || member.email).slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium text-zinc-900">{member.fullName || "(no name)"}</p>
          <p className="text-xs text-zinc-600">
            {member.email} · {member.role}
            {member.officerTitle ? ` · ${member.officerTitle}` : ""}
          </p>
        </div>
      </div>

      <form action={updateAction} className="grid gap-2 md:grid-cols-2">
        <input type="hidden" name="id" value={member.id} />

        <input
          name="fullName"
          defaultValue={member.fullName}
          placeholder="Full name"
          disabled={disabled || updatePending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        />

        <select
          name="role"
          defaultValue={member.role}
          disabled={disabled || updatePending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <input
          name="officerTitle"
          defaultValue={member.officerTitle ?? ""}
          placeholder="Officer title"
          disabled={disabled || updatePending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
        />

        <input
          name="displayOrder"
          type="number"
          defaultValue={member.displayOrder}
          disabled={disabled || updatePending}
          aria-invalid={Boolean(fieldError("displayOrder"))}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
        />

        <div className="flex flex-col gap-1 md:col-span-2">
          <input
            name="avatarUrl"
            defaultValue={member.avatarUrl ?? ""}
            placeholder="Photo URL (https://...)"
            disabled={disabled || updatePending}
            aria-invalid={Boolean(fieldError("avatarUrl"))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("avatarUrl") ? (
            <p className="text-[11px] text-red-600">{fieldError("avatarUrl")}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <input
            name="linkedinUrl"
            defaultValue={member.linkedinUrl ?? ""}
            placeholder="LinkedIn URL"
            disabled={disabled || updatePending}
            aria-invalid={Boolean(fieldError("linkedinUrl"))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100 aria-[invalid=true]:border-red-500"
          />
          {fieldError("linkedinUrl") ? (
            <p className="text-[11px] text-red-600">{fieldError("linkedinUrl")}</p>
          ) : null}
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            disabled={disabled || updatePending}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            {updatePending ? "Saving…" : "Save"}
          </button>
          {updateState.error ? (
            <p role="alert" className="text-xs text-red-600">
              {updateState.error}
            </p>
          ) : null}
          {updateState.ok ? (
            <p role="status" className="text-xs text-emerald-700">
              Saved
            </p>
          ) : null}
        </div>
      </form>

      <form
        action={deleteAction}
        className="mt-2 flex items-center gap-3"
        onSubmit={(e) => {
          if (!confirm(`Delete ${member.fullName || member.email}? This can't be undone.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={member.id} />
        <button
          disabled={disabled || deletePending}
          className="text-xs font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          {deletePending ? "Deleting…" : "Delete member"}
        </button>
        {deleteState.error ? (
          <p role="alert" className="text-xs text-red-600">
            {deleteState.error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
