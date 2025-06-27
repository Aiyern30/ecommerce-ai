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
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const labels = await getImageLabels(imageBase64);
    console.log("Detected Labels:", labels);

    if (!labels || labels.length === 0) {
      return NextResponse.json({ error: "No labels found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(labels.map((label) => `name.ilike.%${label}%`).join(","));

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
