"use client";

import { useActionState, useEffect, useRef } from "react";

import { createMemberAction } from "@/app/admin/members/actions";
import { initialActionState, type ActionState } from "@/app/admin/members/types";

const ROLES = ["member", "officer", "president"] as const;

type Props = { disabled: boolean };

export function CreateMemberForm({ disabled }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createMemberAction,
    initialActionState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <input
          name="email"
          required
          placeholder="sunet@stanford.edu"
          aria-invalid={Boolean(fieldError("email"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("email") ? (
          <p className="text-xs text-red-600">{fieldError("email")}</p>
        ) : null}
      </div>

      <input
        name="fullName"
        placeholder="Full name"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <select
        name="role"
        defaultValue="member"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      <input
        name="officerTitle"
        placeholder="Officer title (e.g. Co-President)"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <div className="flex flex-col gap-1 md:col-span-2">
        <input
          name="avatarUrl"
          placeholder="Photo URL (https://...)"
          aria-invalid={Boolean(fieldError("avatarUrl"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("avatarUrl") ? (
          <p className="text-xs text-red-600">{fieldError("avatarUrl")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <input
          name="linkedinUrl"
          placeholder="LinkedIn URL (https://www.linkedin.com/in/...)"
          aria-invalid={Boolean(fieldError("linkedinUrl"))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
        />
        {fieldError("linkedinUrl") ? (
          <p className="text-xs text-red-600">{fieldError("linkedinUrl")}</p>
        ) : null}
      </div>

      <input
        name="displayOrder"
        type="number"
        defaultValue={0}
        placeholder="Display order"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <button
        disabled={disabled || pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add member"}
      </button>

      {state.error ? (
        <p role="alert" className="md:col-span-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="md:col-span-2 text-sm text-emerald-700">
          Member added.
        </p>
      ) : null}
    </form>
  );
}
