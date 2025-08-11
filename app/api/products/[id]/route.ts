/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Await params in case it's a Promise (for edge/middleware compatibility)
  const params = await context.params;
  const id = params.id;
  const { data: product, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url, is_primary, sort_order)")
    .eq("id", id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Find main image (is_primary or first)
  let image_url = null;
  if (product.product_images && product.product_images.length > 0) {
    const primary = product.product_images.find((img: any) => img.is_primary);
    image_url = primary
      ? primary.image_url
      : product.product_images[0].image_url;
  }

  return NextResponse.json({
    ...product,
    image_url,
  });
}
