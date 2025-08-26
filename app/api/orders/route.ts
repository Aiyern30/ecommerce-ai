import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const orderId = searchParams.get("order_id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        addresses:address_id (
          id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country
        ),
        order_items (
          id,
          product_id,
          name,
          price,
          quantity,
          variant_type,
          image_url
        )
      `
      )
      .eq("user_id", userId);

    if (orderId) {
      query = query.eq("id", orderId);
    }

    query = query.order("created_at", { ascending: false });

    const { data: orders, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Error in orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
