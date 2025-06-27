// /pages/api/search-similar.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getImageEmbedding } from "@/lib/embedImage";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64)
      return res.status(400).json({ message: "Missing imageBase64" });

    const embedding = await getImageEmbedding(imageBase64);

    const { data, error } = await supabase.rpc("search_similar_products", {
      query_vector: embedding,
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      return res.status(500).json({ error });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
