import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch enquiries
    const { data: enquiries, error: enquiriesError } = await supabaseAdmin
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (enquiriesError) {
      return NextResponse.json(
        { error: enquiriesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ enquiries });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
