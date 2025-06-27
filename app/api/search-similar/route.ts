/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getImageLabels } from "@/lib/getImageLabels";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, query } = await req.json();

    let searchTerms: string[] = [];

    // If there's an image, extract labels via Vision API
    if (imageBase64) {
      const labels = await getImageLabels(imageBase64);

      if (!labels || labels.length === 0) {
        return NextResponse.json({ error: "No labels found" }, { status: 404 });
      }

      searchTerms = labels;
    }

    // If there's a text query, use that instead or combine
    if (query && typeof query === "string" && query.trim() !== "") {
      searchTerms.push(query.trim());
    }

    if (searchTerms.length === 0) {
      return NextResponse.json(
        { error: "No image or query provided" },
        { status: 400 }
      );
    }

    // Supabase OR condition with ILIKE
    const ilikeClauses = searchTerms.map((term) => `name.ilike.%${term}%`);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(ilikeClauses.join(","));

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("API Error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
