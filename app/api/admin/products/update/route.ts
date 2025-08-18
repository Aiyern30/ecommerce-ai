// app/api/admin/products/update/route.ts

import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const {
      data,
      productId,
      isDraft,
      imagesToDelete,
      existingImages,
      newImages,
    } = await req.json();

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
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
      })
      .eq("id", productId);

    if (productUpdateError) {
      return NextResponse.json(
        { error: productUpdateError.message },
        { status: 500 }
      );
    }

    // 2. Delete images marked for deletion
    if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      const { data: imagesToDeleteData } = await supabaseAdmin
        .from("product_images")
        .select("image_url, id")
        .in("id", imagesToDelete);

      if (imagesToDeleteData) {
        // Delete from storage
        const storagePaths = imagesToDeleteData.map((img) => {
          const url = new URL(img.image_url);
          return url.pathname.split("/products/")[1];
        });

        if (storagePaths.length > 0) {
          await supabaseAdmin.storage.from("products").remove(storagePaths);
        }

        // Delete from database
        await supabaseAdmin
          .from("product_images")
          .delete()
          .in("id", imagesToDelete);
      }
    }

    // 3. Insert new images
    if (Array.isArray(newImages) && newImages.length > 0) {
      // Get the current maximum sort_order for existing images
      let maxSortOrder = 0;
      if (Array.isArray(existingImages) && existingImages.length > 0) {
        maxSortOrder = Math.max(
          ...existingImages.map((img) => img.sort_order || 0)
        );
      }

      const imageRecords = newImages.map((url: string, i: number) => ({
        product_id: productId,
        image_url: url,
        is_primary: existingImages.length === 0 && i === 0, // Only set as primary if no existing images
        sort_order: maxSortOrder + i + 1,
      }));

      const { error: imageInsertError } = await supabaseAdmin
        .from("product_images")
        .insert(imageRecords);

      if (imageInsertError) {
        return NextResponse.json(
          { error: "Failed to insert new images: " + imageInsertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
