// /app/api/admin/products/create/route.ts

import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    name,
    description,
    grade,
    product_type,
    mortar_ratio,
    category,
    normal_price,
    pump_price,
    tremie_1_price,
    tremie_2_price,
    tremie_3_price,
    unit,
    stock_quantity,
    status,
    is_featured,
    images,
  } = body;

  if (!name || !grade || !product_type || !category || !unit || !status) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const { data: product, error: insertError } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      description: description || null,
      grade,
      product_type,
      mortar_ratio: product_type === "mortar" ? mortar_ratio || null : null,
      category,
      normal_price: normal_price || null,
      pump_price: pump_price || null,
      tremie_1_price: tremie_1_price || null,
      tremie_2_price: tremie_2_price || null,
      tremie_3_price: tremie_3_price || null,
      unit,
      stock_quantity,
      status,
      is_featured,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to insert product: " + insertError.message },
      { status: 500 }
    );
  }

  const productId = product.id;

  if (Array.isArray(images) && images.length > 0) {
    const imageRecords = images.map((url: string, i: number) => ({
      product_id: productId,
      image_url: url,
      is_primary: i === 0,
      sort_order: i,
    }));

    const { error: imageError } = await supabaseAdmin
      .from("product_images")
      .insert(imageRecords);

    if (imageError) {
      return NextResponse.json(
        { error: "Failed to insert product images: " + imageError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true, productId });
}
