// app/api/admin/blogs/update/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const {
    id,
    title,
    description,
    link_name,
    link,
    content,
    status,
    tags,
    images,
    removedImages,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing blog id" }, { status: 400 });
  }

  // 1. Update main blog
  const { error: blogError } = await supabase
    .from("blogs")
    .update({
      title,
      description,
      link_name,
      link,
      content,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (blogError) {
    return NextResponse.json({ error: blogError.message }, { status: 500 });
  }

  // 2. Update tags
  await supabase.from("blog_tags").delete().eq("blog_id", id);
  if (tags?.length > 0) {
    await supabase
      .from("blog_tags")
      .insert(tags.map((tagId: string) => ({ blog_id: id, tag_id: tagId })));
  }

  // 3. Update images
  await supabase.from("blog_images").delete().eq("blog_id", id);
  if (images?.length > 0) {
    await supabase
      .from("blog_images")
      .insert(images.map((url: string) => ({ blog_id: id, image_url: url })));
  }

  // 4. Delete removed images from Supabase Storage
  if (removedImages?.length > 0) {
    const pathsToRemove = removedImages
      .map((url: string) => {
        const parts = url.split("/storage/v1/object/public/blogs/");
        return parts[1] ?? null;
      })
      .filter(Boolean);

    if (pathsToRemove.length > 0) {
      await supabase.storage.from("blogs").remove(pathsToRemove);
    }
  }

  return NextResponse.json({ message: "Blog updated" });
}
