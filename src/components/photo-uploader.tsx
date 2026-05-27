"use client";

import { useId, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const BUCKET = "event-photos";
const MAX_SIZE_MB = 10;

type SingleProps = {
  /** Form field name. The hidden input keeps the URL submitted with the form. */
  inputName: string;
  /** Existing URL (or empty). */
  defaultValue?: string;
  multiple?: false;
};

type MultipleProps = {
  inputName: string;
  defaultValue?: string;
  /** Render as a textarea (one URL per line). Uploads append to it. */
  multiple: true;
};

type Props = SingleProps | MultipleProps;

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 8) return fromName.toLowerCase();
  if (file.type.startsWith("image/")) return file.type.split("/")[1] ?? "jpg";
  return "bin";
}

export function PhotoUploader(props: Props) {
  const { inputName, defaultValue = "" } = props;
  const multiple = props.multiple === true;
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    console.log("[PhotoUploader] handleFiles started with", files.length, "file(s)");
    setUploading(true);
    setErrors([]);
    const collected: string[] = [];
    try {
      const supabase = createSupabaseBrowserClient();
      const newUrls: string[] = [];

      for (const file of files) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          console.warn("[PhotoUploader] too large:", file.name, file.size);
          collected.push(`${file.name} is larger than ${MAX_SIZE_MB} MB.`);
          continue;
        }
        const path = `${crypto.randomUUID()}.${extensionOf(file)}`;
        console.log("[PhotoUploader] uploading", file.name, "→", path);
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });
        if (upErr) {
          console.error("[PhotoUploader] upload error for", file.name, upErr);
          collected.push(`${file.name}: ${upErr.message}`);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        console.log("[PhotoUploader] uploaded", file.name, "→", data.publicUrl);
        newUrls.push(data.publicUrl);
      }

      console.log(
        "[PhotoUploader] loop done. successful uploads:",
        newUrls.length,
        "of",
        files.length
      );

      if (newUrls.length > 0) {
        if (multiple) {
          setValue((prev) => {
            const existing = prev
              .split(/\n/)
              .map((s) => s.trim())
              .filter(Boolean);
            return [...existing, ...newUrls].join("\n");
          });
        } else {
          setValue(newUrls[0]!);
        }
      }
    } catch (err) {
      collected.push(err instanceof Error ? err.message : String(err));
    } finally {
      if (collected.length > 0) setErrors(collected);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {multiple ? (
          <textarea
            id={inputId}
            name={inputName}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder={"https://...\nhttps://..."}
            className="flex-1 rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs"
          />
        ) : (
          <input
            id={inputId}
            name={inputName}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs"
          />
        )}
        <label className="inline-flex shrink-0 cursor-pointer items-center rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50">
          {uploading ? "Uploading…" : multiple ? "Upload photos" : "Upload"}
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              console.log(
                "[PhotoUploader] file picker returned",
                files.length,
                "file(s). multiple attribute:",
                multiple,
                "files:",
                files.map((f) => `${f.name} (${f.size}B, ${f.type})`)
              );
              e.target.value = "";
              void handleFiles(files);
            }}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Thumbnail previews */}
      {multiple ? (
        <Previews urls={value.split(/\n/).map((s) => s.trim()).filter(Boolean)} />
      ) : value ? (
        <Previews urls={[value]} />
      ) : null}

      {errors.length > 0 ? (
        <ul className="space-y-0.5 text-[11px] text-red-600">
          {errors.map((msg) => (
            <li key={msg}>• {msg}</li>
          ))}
        </ul>
      ) : null}
      <p className="text-[11px] text-zinc-500">
        Max {MAX_SIZE_MB} MB per image. Uploaded to Supabase Storage; URLs go into
        the field above. You can also paste URLs manually.
      </p>
    </div>
  );
}

function Previews({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {urls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt=""
          className="h-12 w-12 rounded object-cover ring-1 ring-zinc-200"
        />
      ))}
    </div>
  );
}
