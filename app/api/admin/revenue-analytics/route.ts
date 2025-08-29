import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("created_at, total, payment_status")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching orders for revenue analytics:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(
      `✅ Fetched ${orders?.length || 0} orders for revenue analytics`
    );

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
    });
  } catch (error) {
    console.error("❌ Failed to fetch revenue analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch revenue analytics",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
