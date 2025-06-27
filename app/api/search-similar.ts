// /pages/api/search-similar.ts

import { getImageEmbedding } from "@/lib/embedImage";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { imageBase64 } = req.body;
  const embedding = await getImageEmbedding(imageBase64);
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data } = await supabase.rpc("search_similar_products", {
    query_vector: embedding,
  });

  res.status(200).json(data);
}
