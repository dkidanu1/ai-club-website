"use server";

import { revalidatePath } from "next/cache";

import { requireOfficer } from "@/lib/auth";
import { getVideoEmbed } from "@/lib/library";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ActionState } from "@/app/admin/library/types";

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function decodeHtmlEntity(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMeta(html: string, attr: "property" | "name", key: string): string | null {
  const re1 = new RegExp(
    `<meta\\s+[^>]*?${attr}=["']${key}["'][^>]*?content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta\\s+[^>]*?content=["']([^"']+)["'][^>]*?${attr}=["']${key}["']`,
    "i"
  );
  const m = html.match(re1) ?? html.match(re2);
  return m?.[1] ? decodeHtmlEntity(m[1]) : null;
}

async function fetchOgMetadata(url: string): Promise<{
  imageUrl: string | null;
  title: string | null;
  description: string | null;
}> {
  try {
    const res = await fetch(url, {
      headers: {
        // Some sites only return rich OG tags to "real" browsers/bots.
        "User-Agent":
          "Mozilla/5.0 (compatible; AI-Club-Bot/1.0; +https://aiclub.stanford.edu)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { imageUrl: null, title: null, description: null };
    const html = (await res.text()).slice(0, 200_000); // cap for safety

    let imageUrl =
      extractMeta(html, "property", "og:image") ??
      extractMeta(html, "name", "twitter:image") ??
      null;
    if (imageUrl && imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;
    if (imageUrl && imageUrl.startsWith("/")) {
      try {
        imageUrl = new URL(imageUrl, url).toString();
      } catch {}
    }

    const title =
      extractMeta(html, "property", "og:title") ??
      extractMeta(html, "name", "twitter:title") ??
      null;
    const description =
      extractMeta(html, "property", "og:description") ??
      extractMeta(html, "name", "description") ??
      extractMeta(html, "name", "twitter:description") ??
      null;

    return { imageUrl, title, description };
  } catch {
    return { imageUrl: null, title: null, description: null };
  }
}

function revalidateLibrarySurfaces() {
  revalidatePath("/admin/library");
  revalidatePath("/library");
  revalidatePath("/");
}

export async function createArticleItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const title = String(formData.get("title") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const sourceName = String(formData.get("sourceName") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  const fieldErrors: Record<string, string> = {};
  if (!externalUrl) fieldErrors.externalUrl = "Article URL is required.";
  else if (!isHttpUrl(externalUrl)) fieldErrors.externalUrl = "Must be a valid http(s) URL.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  // Best-effort scrape of OG metadata so the admin can paste just a URL.
  const og = await fetchOgMetadata(externalUrl);

  const { error } = await supabase.from("library_items").insert({
    title: title || og.title || externalUrl,
    type: "article",
    external_url: externalUrl,
    image_url: og.imageUrl,
    source_name: sourceName || null,
    excerpt: excerpt || og.description || null,
    tags,
    status: "draft",
  });

  if (error) {
    console.error("createArticleItemAction failed:", error);
    return { ok: false, error: `Failed to add article: ${error.message}` };
  }
  revalidateLibrarySurfaces();
  return { ok: true };
}

export async function createVideoItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const title = String(formData.get("title") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!externalUrl) fieldErrors.externalUrl = "Video URL is required.";
  else if (!isHttpUrl(externalUrl)) fieldErrors.externalUrl = "Must be a valid http(s) URL.";
  else if (!getVideoEmbed(externalUrl)) {
    fieldErrors.externalUrl =
      "Unsupported provider. Use a YouTube, Vimeo, or Loom URL.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase.from("library_items").insert({
    title,
    type: "video",
    external_url: externalUrl,
    excerpt: excerpt || null,
    tags,
    status: "draft",
  });

  if (error) {
    console.error("createVideoItemAction failed:", error);
    return { ok: false, error: `Failed to add video: ${error.message}` };
  }
  revalidateLibrarySurfaces();
  return { ok: true };
}

export async function updateLibraryItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const sourceName = String(formData.get("sourceName") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  if (!id) return { ok: false, error: "Missing item id." };
  if (type !== "article" && type !== "video") {
    return { ok: false, error: "Invalid type." };
  }

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!externalUrl) fieldErrors.externalUrl = "URL is required.";
  else if (!isHttpUrl(externalUrl)) fieldErrors.externalUrl = "Must be a valid http(s) URL.";
  else if (type === "video" && !getVideoEmbed(externalUrl)) {
    fieldErrors.externalUrl =
      "Unsupported provider. Use a YouTube, Vimeo, or Loom URL.";
  }
  if (imageUrl && !isHttpUrl(imageUrl)) {
    fieldErrors.imageUrl = "Must be a valid http(s) URL.";
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase
    .from("library_items")
    .update({
      title,
      external_url: externalUrl,
      image_url: imageUrl || null,
      source_name: sourceName || null,
      excerpt: excerpt || null,
      tags,
    })
    .eq("id", id);

  if (error) {
    console.error("updateLibraryItemAction failed:", error);
    return { ok: false, error: `Failed to update: ${error.message}` };
  }
  revalidateLibrarySurfaces();
  return { ok: true };
}

export async function refetchArticleOgAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  if (!id || !externalUrl) return { ok: false, error: "Missing id or URL." };

  const og = await fetchOgMetadata(externalUrl);
  const { error } = await supabase
    .from("library_items")
    .update({
      image_url: og.imageUrl,
    })
    .eq("id", id);

  if (error) {
    console.error("refetchArticleOgAction failed:", error);
    return { ok: false, error: `Failed to refetch: ${error.message}` };
  }
  revalidateLibrarySurfaces();
  return og.imageUrl
    ? { ok: true }
    : { ok: false, error: "Page didn't expose an OG image. Paste an image URL manually." };
}

export async function updateLibraryItemStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) return { ok: false, error: "Missing item id." };
  if (!["draft", "published"].includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const { error } = await supabase
    .from("library_items")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateLibraryItemStatusAction failed:", error);
    return { ok: false, error: `Failed to update status: ${error.message}` };
  }
  revalidateLibrarySurfaces();
  return { ok: true };
}

export async function deleteLibraryItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing item id." };

  const { error } = await supabase.from("library_items").delete().eq("id", id);
  if (error) {
    console.error("deleteLibraryItemAction failed:", error);
    return { ok: false, error: `Failed to delete: ${error.message}` };
  }
  revalidateLibrarySurfaces();
  return { ok: true };
}
