import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.rpc("get_product_performance");

    if (error) console.error("Error fetching product performance:", error);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching cart analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart analytics" },
      { status: 500 }
    );
  }
}
