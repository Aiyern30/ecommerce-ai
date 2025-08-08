// app/api/admin/products/update/route.ts

import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { data, productId, isDraft, imagesToDelete } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    // 1. Update product
    const { error: productUpdateError } = await supabaseAdmin
      .from("products")
      .update({
        name: data.name,
        description: data.description || null,
        grade: data.grade,
        product_type: data.product_type,
        mortar_ratio:
          data.product_type === "mortar" ? data.mortar_ratio || null : null,
        category: data.category,
        normal_price: data.normal_price || null,
        pump_price: data.pump_price || null,
        tremie_1_price: data.tremie_1_price || null,
        tremie_2_price: data.tremie_2_price || null,
        tremie_3_price: data.tremie_3_price || null,
        unit: data.unit,
        stock_quantity: data.stock_quantity,
        status: isDraft ? "draft" : data.status,
        is_featured: data.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (productUpdateError) {
      return NextResponse.json(
        { error: productUpdateError.message },
        { status: 500 }
      );
    }

    // 2. Delete images
    if (imagesToDelete.length > 0) {
      const { data: images } = await supabaseAdmin
        .from("product_images")
        .select("image_url, id")
        .in("id", imagesToDelete);

      if (images) {
        const storagePaths = images.map((img) => {
          const url = new URL(img.image_url);
          return url.pathname.split("/products/")[1];
        });

        if (storagePaths.length > 0) {
          await supabaseAdmin.storage.from("products").remove(storagePaths);
        }

        await supabaseAdmin
          .from("product_images")
          .delete()
          .in("id", imagesToDelete);
      }
    }

    // 3. Upload new images (assumed to be handled client-side)

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
