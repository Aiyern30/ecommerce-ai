// /app/api/admin/blogs/delete/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "No blog IDs provided." },
      { status: 400 }
    );
  }

  try {
    // Delete related blog_tags and blog_images first to maintain integrity
    await supabase.from("blog_tags").delete().in("blog_id", ids);
    await supabase.from("blog_images").delete().in("blog_id", ids);

    // Delete blogs
    const { error } = await supabase.from("blogs").delete().in("id", ids);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete blogs: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Deletion error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
