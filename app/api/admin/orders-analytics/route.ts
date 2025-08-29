import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Use supabaseAdmin to bypass RLS and get all orders
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching orders for analytics:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`✅ Fetched ${orders?.length || 0} orders for analytics`);

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
    });
  } catch (error) {
    console.error("❌ Failed to fetch orders analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders analytics",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
