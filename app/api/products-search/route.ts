import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";

  const supabase = createRouteHandlerClient({ cookies });

  let queryBuilder = supabase
    .from("products")
    .select(
      `
      *,
      product_images (
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order
      )
    `
    )
    .eq("is_active", true)
    .eq("status", "published")
    .gt("stock_quantity", 0)
    .limit(10);

  if (q && q.length >= 2) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${q}%,grade.ilike.%${q}%,keywords.cs.{${q}}`
    );
  }

  const { data, error } = await queryBuilder;

  if (error) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  return NextResponse.json({ products: data || [] });
}
