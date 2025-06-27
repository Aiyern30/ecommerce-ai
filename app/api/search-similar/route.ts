/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/search-similar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getImageEmbedding } from "@/lib/embedImage";
import { createClient } from "@supabase/supabase-js";

// Safe to use in server-side (API route)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use anon key if public, but better service role here
);

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const embedding = await getImageEmbedding(imageBase64);

    if (!Array.isArray(embedding)) {
      console.error("Embedding is not array:", embedding);
      return NextResponse.json({ error: "Invalid embedding" }, { status: 500 });
    }

    const { data, error } = await supabase.rpc("match_similar_products", {
      query_embedding: embedding,
      match_threshold: 0.8,
      match_count: 5,
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API error:", err.message || err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
