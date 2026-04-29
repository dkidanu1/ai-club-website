"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export async function createArticleItemAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const title = String(formData.get("title") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const sourceName = String(formData.get("sourceName") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  if (!title || !externalUrl) return;

  const { error } = await supabase.from("library_items").insert({
    title,
    type: "article",
    external_url: externalUrl,
    source_name: sourceName || null,
    excerpt: excerpt || null,
    tags,
    status: "draft",
  });

  if (error) return;
  revalidatePath("/admin/library");
  revalidatePath("/library");
}

export async function createGranolaItemAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const title = String(formData.get("title") ?? "").trim();
  const fullText = String(formData.get("fullText") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  if (!title || !fullText) return;

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const { error } = await supabase.from("library_items").insert({
    title,
    type: "granola",
    full_text: fullText,
    excerpt: fullText.slice(0, 240),
    word_count: wordCount,
    tags,
    status: "draft",
  });

  if (error) return;
  revalidatePath("/admin/library");
  revalidatePath("/library");
}

export async function updateLibraryItemStatusAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published"].includes(status)) return;

  const { error } = await supabase
    .from("library_items")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return;
  revalidatePath("/admin/library");
  revalidatePath("/library");
}
