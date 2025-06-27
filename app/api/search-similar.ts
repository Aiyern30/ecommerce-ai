// /pages/api/search-similar.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getImageEmbedding } from "@/lib/embedImage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: "Missing imageBase64" });
  }

  try {
    const embedding = await getImageEmbedding(imageBase64);
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await supabase.rpc("search_similar_products", {
      query_vector: embedding,
    });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Failed to fetch from Supabase" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
