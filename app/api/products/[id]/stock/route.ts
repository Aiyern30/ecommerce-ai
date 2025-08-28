import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity, grade, product_type")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch product stock" },
      { status: 500 }
    );
  }
}
