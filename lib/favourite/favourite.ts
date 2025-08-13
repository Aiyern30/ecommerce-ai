// lib/favorites.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type FavoriteType = "blog" | "product";

export interface FavoriteRecord {
  id: string;
  user_id: string;
  item_type: FavoriteType;
  item_id: string;
  created_at: string;
}

/** Returns true if current user has favorited the item */
export async function isFavorited(itemId: string, type: FavoriteType) {
  const supabase = createClientComponentClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", type)
    .eq("item_id", itemId)
    .maybeSingle();

  return Boolean(data?.id);
}

/** Toggle favorite for current user (add if missing, remove if exists). */
export async function toggleFavorite(itemId: string, type: FavoriteType) {
  const supabase = createClientComponentClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not authenticated");

  // Does it exist?
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", type)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing?.id) {
    // remove
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { status: "removed" as const };
  }

  // add
  const { error } = await supabase.from("favorites").insert([
    {
      user_id: user.id, // checked by RLS with-check
      item_type: type,
      item_id: itemId,
    },
  ]);
  if (error) throw error;
  return { status: "added" as const };
}

/** Convenience: fetch favorites grouped by type, joined with basic fields */
export async function getFavoritesGrouped() {
  const supabase = createClientComponentClient();

  // Blogs
  const { data: blogFavs, error: blogErr } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      item_id,
      blogs: item_id (
        id,
        title,
        description,
        created_at,
        blog_images ( image_url )
      )
    `
    )
    .eq("item_type", "blog")
    .order("created_at", { ascending: false });

  if (blogErr) throw blogErr;

  // Products
  const { data: productFavs, error: productErr } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      item_id,
      products: item_id (
        id,
        name,
        normal_price,
        pump_price,
        product_images ( image_url, is_primary, sort_order )
      )
    `
    )
    .eq("item_type", "product")
    .order("created_at", { ascending: false });

  if (productErr) throw productErr;

  return {
    blogs: (blogFavs ?? []).map((fav) => fav.blogs),
    products: (productFavs ?? []).map((fav) => fav.products),
  };
}
